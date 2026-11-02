// Company email is an alias of the existing unique username.
function loginUsername(value) {
  const identity = value.trim().toLowerCase();
  const username = identity.endsWith('@ciril.in') ? identity.slice(0, -9) : identity;
  return username.length <= 80 && !username.includes('@') ? username : '';
}
module.exports = { loginUsername };
