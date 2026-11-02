const assert = require('node:assert/strict');
const { requireSignInLocation, requireNotPunchedOut } = require('../src/auth/workday');
const { shiftReminder } = require('../src/workspace/work-time');
const { workday } = require('../src/auth/workday');

(async () => {
  for (const time of ['2026-10-26T18:31:00Z', '2026-10-26T21:30:00Z', '2026-10-25T06:00:00Z']) {
    let parameters;
    const empty = { execute: async (sql, args) => { parameters = args; return [[]]; } };
    await requireSignInLocation(empty, 7, { status: 'offsite' }, new Date(time));
    assert.equal(parameters[0], 7);
    assert.equal(parameters[2] - parameters[1], 86400000);
    assert.equal(parameters[1].toISOString().slice(11), '18:30:00.000Z');
  }
  const officeHistory = { execute: async () => [[{ id: 'office-punch' }]] };
  await assert.rejects(requireSignInLocation(officeHistory, 7, { status: 'offsite' }), /started an office session today/);
  await requireSignInLocation(officeHistory, 7, { status: 'onsite' });
  await assert.rejects(requireSignInLocation(officeHistory, 7, { status: 'unknown' }), /could not be verified/);
  await assert.rejects(requireNotPunchedOut(officeHistory, 7), /already punched out today/);
  const weekday = workday(new Date('2026-10-27T06:00:00Z'));
  assert.equal(shiftReminder(weekday, new Date('2026-10-27T11:59:59Z')), null);
  assert.match(shiftReminder(weekday, new Date('2026-10-27T12:00:00Z')).message, /30 minutes/);
  assert.match(shiftReminder(weekday, new Date('2026-10-27T12:31:00Z')).message, /not be signed out automatically/);
  const saturday = workday(new Date('2026-10-24T06:00:00Z'));
  assert.match(shiftReminder(saturday, new Date('2026-10-24T10:00:00Z')).message, /16:00/);
  assert.equal(shiftReminder(workday(new Date('2026-10-25T06:00:00Z')), new Date('2026-10-25T12:00:00Z')), null);
  console.log('PASS: off-site policy at midnight, overnight and Sunday; office-history and completed-office-punch gates.');
})().catch(error => { console.error(error); process.exitCode = 1; });
