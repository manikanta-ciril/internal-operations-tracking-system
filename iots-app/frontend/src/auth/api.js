export async function authApi(path, body) {
  let response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch { throw new Error('Cannot reach the login server. Start npm.cmd run dev in the frontend folder.'); }
  const data = await response.json().catch(() => ({ message: 'The login server is unavailable.' }));
  if (!response.ok) { const error = new Error(data.message); error.status = response.status; throw error; }
  return data;
}
