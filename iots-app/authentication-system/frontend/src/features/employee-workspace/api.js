import { requestLabel, trackOperation } from "../../shared/feedback/operations";
async function request(path = "", { body, signal, file } = {}) {
  let response;
  try {
    response = await fetch(`/api/auth/workspace${path}`, {
      method: body === undefined && !file ? "GET" : "POST",
      credentials: "same-origin",
      signal,
      headers: file
        ? { "Content-Type": file.type }
        : body === undefined
          ? {}
          : { "Content-Type": "application/json" },
      body: file || (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Server is unreachable");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(
      new Error(data.message || "Could not load your workspace. Try again."),
      { status: response.status },
    );
  return data;
}

export function workspaceApi(path = "", options = {}) {
  return options.body !== undefined || options.file ? trackOperation(requestLabel(path), () => request(path, options)) : request(path, options);
}
