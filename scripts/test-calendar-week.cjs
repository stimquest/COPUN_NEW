const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const file = path.resolve(__dirname, '../src/lib/stage-dates.ts');
const moduleDates = new Module(file);
moduleDates._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, file);
const { calendarWeek, parseStageDateRange, dateISOAParis } = moduleDates.exports;

for (const timezone of ['UTC', 'Europe/Paris', 'America/Los_Angeles']) {
    process.env.TZ = timezone;
    assert.deepEqual(calendarWeek(false, new Date('2026-10-04T21:59:59Z')), { start: '2026-09-28', end: '2026-10-04', today: '2026-10-04' });
    assert.deepEqual(calendarWeek(false, new Date('2026-10-04T22:00:00Z')), { start: '2026-10-05', end: '2026-10-11', today: '2026-10-05' });
    assert.deepEqual(calendarWeek(false, new Date('2026-10-25T23:30:00Z')), { start: '2026-10-26', end: '2026-11-01', today: '2026-10-26' });
    const prepared = calendarWeek(true, new Date('2026-12-31T12:00:00Z'));
    const opened = calendarWeek(false, new Date('2027-01-04T12:00:00Z'));
    assert.equal(prepared.start, opened.start, 'A prepared week must become the current week');
    assert.equal(prepared.end, opened.end);
    const range = parseStageDateRange('28 déc. 2026 - 3 janv. 2027', new Date('2026-12-31T12:00:00Z'));
    assert.equal(dateISOAParis(range.start), '2026-12-28');
    assert.equal(dateISOAParis(range.end), '2027-01-03');
}
console.log('Calendar weeks: Paris midnight, daylight saving, year boundary and prepared-week rollover pass in three server timezones.');
