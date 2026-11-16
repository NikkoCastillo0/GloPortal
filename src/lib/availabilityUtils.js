export const SHOP_TIMEZONE = 'America/Los_Angeles';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORTS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getShopToday(timeZone = SHOP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const part = (type) => parts.find((p) => p.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getMondayOfWeek(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = d.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return d.toISOString().slice(0, 10);
}

export function getWeekDates(mondayStr) {
  const [year, month, day] = mondayStr.split('-').map(Number);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(year, month - 1, day + i, 12, 0, 0));
    const dayOfWeek = d.getUTCDay();
    const curYear = d.getUTCFullYear();
    const curMonth = d.getUTCMonth();
    const curDay = d.getUTCDate();

    days.push({
      dateStr: d.toISOString().slice(0, 10),
      dayIndex: i,
      dayName: DAY_NAMES[dayOfWeek],
      dayShort: DAY_SHORTS[dayOfWeek],
      formattedDate: `${MONTH_NAMES[curMonth]} ${curDay}, ${curYear}`,
      shortDate: `${MONTH_NAMES[curMonth]} ${curDay}`,
    });
  }

  return days;
}

export function formatWeekRange(mondayStr) {
  const weekDays = getWeekDates(mondayStr);
  const first = new Date(`${weekDays[0].dateStr}T12:00:00Z`);
  const last = new Date(`${weekDays[6].dateStr}T12:00:00Z`);

  const fM = MONTH_NAMES[first.getUTCMonth()];
  const lM = MONTH_NAMES[last.getUTCMonth()];
  const fD = first.getUTCDate();
  const lD = last.getUTCDate();
  const fY = first.getUTCFullYear();
  const lY = last.getUTCFullYear();

  if (fY === lY) {
    return `${fM} ${fD} – ${lM} ${lD}, ${fY}`;
  }

  return `${fM} ${fD}, ${fY} – ${lM} ${lD}, ${lY}`;
}

export function getTimezoneOffsetMinutes(
  dateStr,
  timeStr = '12:00',
  timeZone = SHOP_TIMEZONE,
) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hourCycle: 'h23',
  }).formatToParts(utcGuess);

  const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value;
  const match = tzPart?.match(/GMT([+-])(\d+)(?::(\d+))?/);

  if (match) {
    const sign = match[1] === '-' ? -1 : 1;
    return sign * (
      Number(match[2]) * 60 + Number(match[3] ?? 0)
    );
  }

  return -480;
}

export function localToTzOffsetString(
  dateStr,
  timeStr,
  timeZone = SHOP_TIMEZONE,
) {
  const offsetMinutes = getTimezoneOffsetMinutes(dateStr, timeStr, timeZone);
  const sign = offsetMinutes < 0 ? '-' : '+';
  const absMins = Math.abs(offsetMinutes);
  const h = String(Math.floor(absMins / 60)).padStart(2, '0');
  const m = String(absMins % 60).padStart(2, '0');
  const [hour, min] = timeStr.split(':');

  return `${dateStr}T${String(hour).padStart(2, '0')}:${String(min || '00').padStart(2, '0')}:00${sign}${h}:${m}`;
}

export function tzIsoToTime24(isoStr, timeZone = SHOP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(isoStr));

  const hour = parts.find((p) => p.type === 'hour')?.value;
  const minute = parts.find((p) => p.type === 'minute')?.value;
  return `${hour?.padStart(2, '0')}:${minute?.padStart(2, '0')}`;
}

export function formatTime12(time24) {
  if (!time24) return '';

  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  return `${h % 12 === 0 ? 12 : h % 12}:${mStr.padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function formatSlotRange(startTime24, endTime24) {
  return `${formatTime12(startTime24)} – ${formatTime12(endTime24)}`;
}