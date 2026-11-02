const assert = require('node:assert/strict');
const { roleDefinitions, organisationPolicy } = require('../src/workspace/organisation');
assert.equal(new Set(roleDefinitions.map(([code]) => code)).size, roleDefinitions.length);
assert.ok(roleDefinitions.some(([code]) => code === 'coordinator'));
assert.deepEqual(organisationPolicy('creative-communication-associate').reportsTo, ['coordinator', 'general-manager', 'senior-manager', 'executive', 'chairman']);
assert.deepEqual(organisationPolicy('it-system-analyst').reportsTo, ['general-manager', 'senior-manager', 'executive', 'chairman']);
for (const role of ['chairman', 'admin', 'super-admin']) assert.equal(organisationPolicy(role).dailyReportEnabled, false);
for (const role of ['coordinator', 'executive', 'general-manager', 'senior-manager', 'lead-manager', 'it-system-analyst', 'business-development-executive', 'creative-communication-associate']) assert.equal(organisationPolicy(role).dailyReportEnabled, true);
console.log('PASS: roles, reporting chain, operational controllers and report exclusions.');
