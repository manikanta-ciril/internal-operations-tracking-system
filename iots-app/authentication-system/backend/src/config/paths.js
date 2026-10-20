const path = require('node:path');
const backend = path.resolve(__dirname, '../..');
const application = path.resolve(backend, '../..');
const repository = path.resolve(application, '..');
module.exports = { backend, application, repository, frontend: path.join(application, 'authentication-system/frontend'), local: path.join(repository, '.local') };
