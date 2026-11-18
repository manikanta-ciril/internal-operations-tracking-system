const allowedParameters = new Set(["page", "per_page", "status", "from", "to"]);

function crmUrl(path, query, environment = process.env) {
  if (!environment.CRM_API_BASE_URL || !environment.CRM_API_TOKEN) {
    throw Object.assign(new Error("CRM connection is not configured."), { status: 503 });
  }
  const base = new URL(environment.CRM_API_BASE_URL);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if (base.username || base.password || base.search || base.hash ||
      (base.protocol !== "https:" && !(base.protocol === "http:" && local && environment.NODE_ENV !== "production"))) {
    throw Object.assign(new Error("CRM connection URL is invalid."), { status: 503 });
  }
  const url = new URL(base.href.replace(/\/$/, "") + "/" + path);
  for (const [key, value] of Object.entries(query)) {
    if (!allowedParameters.has(key) || typeof value !== "string" || value.length > 40) {
      throw Object.assign(new Error("Invalid CRM filter."), { status: 400 });
    }
    if (["page", "per_page", "status"].includes(key) &&
        (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) ||
         Number(value) < (key === "status" ? 0 : 1) || (key === "per_page" && Number(value) > 100))) {
      throw Object.assign(new Error("Invalid CRM pagination or status."), { status: 400 });
    }
    if (["from", "to"].includes(key) && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value)) {
      throw Object.assign(new Error("Use a valid YYYY-MM-DD date."), { status: 400 });
    }
    url.searchParams.set(key, value);
  }
  if (query.from && query.to && query.from > query.to) {
    throw Object.assign(new Error("End date must follow start date."), { status: 400 });
  }
  return url;
}

async function fetchCrm(path, query = {}, { environment = process.env, fetcher = fetch } = {}) {
  const url = crmUrl(path, query, environment);
  let response;
  try {
    response = await fetcher(url, {
      headers: { Accept: "application/json", Authorization: "Bearer " + environment.CRM_API_TOKEN },
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
  } catch {
    throw Object.assign(new Error("CRM could not be reached. Retry shortly."), { status: 502 });
  }
  if (!response.ok) {
    const status = response.status === 429 ? 429 : response.status === 404 ? 404 : 502;
    throw Object.assign(new Error(status === 429 ? "CRM request limit reached. Retry shortly." :
      status === 404 ? "CRM record not found." : "CRM rejected the connection. Ask an administrator to check it."), { status });
  }
  try {
    const result = await response.json();
    if (!result || !Object.hasOwn(result, "data")) throw new Error("Invalid response");
    return { data: result.data, ...(result.meta ? { meta: result.meta } : {}), source: "CIRIL CRM", fetched_at: result.fetched_at || null };
  } catch {
    throw Object.assign(new Error("CRM returned an invalid response."), { status: 502 });
  }
}

module.exports = { crmUrl, fetchCrm };
