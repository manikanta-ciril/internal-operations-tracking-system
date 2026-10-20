export async function authApi(path, body) {
  let response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch { throw new Error('Server is unreachable'); }
  const data = await response.json().catch(() => ({ message: 'Server is unreachable' }));
  if (!response.ok) { const error = new Error(data.message); error.status = response.status; throw error; }
  return data;
}
