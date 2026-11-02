const roleDefinitions = [
  ['chairman', 'Chairman'],
  ['general-manager', 'General Manager'],
  ['senior-manager', 'Senior Manager'],
  ['executive', 'Executive'],
  ['lead-manager', 'Lead / Operations Manager'],
  ['coordinator', 'Coordinator'],
  ['business-development-executive', 'Business Development Executive'],
  ['creative-communication-associate', 'Graphic Designer / Creative Communication Associate'],
  ['it-system-analyst', 'IT System Analyst'],
  ['super-admin', 'Super Admin'],
  ['admin', 'Admin'],
];

const management = ['general-manager', 'senior-manager', 'executive', 'chairman'];
const reportingRoles = {
  'chairman': [],
  'general-manager': ['chairman'],
  'senior-manager': ['chairman'],
  'executive': ['chairman'],
  'lead-manager': management,
  'business-development-executive': management,
  'it-system-analyst': management,
  'coordinator': management,
  'creative-communication-associate': ['coordinator', ...management],
};

function organisationPolicy(activeRole) {
  const reportsTo = Object.hasOwn(reportingRoles, activeRole) ? reportingRoles[activeRole] : [];
  return {
    reportsTo,
    operationalControllerRoles: ['general-manager', 'senior-manager'],
    dailyReportEnabled: Object.hasOwn(reportingRoles, activeRole) && activeRole !== 'chairman',
    chairmanScope: 'Operational health, team performance, revenue and escalations',
  };
}

module.exports = { roleDefinitions, organisationPolicy };
