export interface ScheduledTalk {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  timeZone?: string;
  event: string;
  location: string;
  abstract: string;
  eventWebsite?: string;
}

const utc = (value: string | Date) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
export function calendarEvent(talk: ScheduledTalk, speaker: string) {
  if (!talk.endDate || !Number.isFinite(Date.parse(talk.date)) || !Number.isFinite(Date.parse(talk.endDate)) || Date.parse(talk.endDate) <= Date.parse(talk.date)) return undefined;
  const timeZone = talk.timeZone ?? "Europe/Luxembourg";
  const description = [`Speaker: ${speaker}`, `Event: ${talk.event}`, `Time zone: ${timeZone}`, "", talk.abstract, ...(talk.eventWebsite ? ["", talk.eventWebsite] : [])].join("\n");
  const google = new URL("https://calendar.google.com/calendar/render");
  google.search = new URLSearchParams({ action: "TEMPLATE", text: talk.title, dates: `${utc(talk.date)}/${utc(talk.endDate)}`, ctz: timeZone, details: description, location: talk.location }).toString();
  const outlook = new URL("https://outlook.office.com/calendar/0/deeplink/compose");
  outlook.search = new URLSearchParams({ path: "/calendar/action/compose", rru: "addevent", subject: talk.title, startdt: new Date(talk.date).toISOString(), enddt: new Date(talk.endDate).toISOString(), body: description, location: talk.location, allday: "false" }).toString();
  return { ...talk, endDate: talk.endDate, timeZone, description, google: google.href, outlook: outlook.href };
}

const escapeText = (text: string) => text.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
// RFC 5545 lines fold at 75 octets; never split a UTF-8 character.
function fold(line: string) {
  const lines: string[] = [];
  let part = "", bytes = 0;
  for (const character of line) {
    const length = new TextEncoder().encode(character).length;
    if (bytes + length > 75) { lines.push(part); part = " "; bytes = 1; }
    part += character; bytes += length;
  }
  return [...lines, part].join("\r\n");
}

export function eventIcs(event: NonNullable<ReturnType<typeof calendarEvent>>, generatedAt = new Date()) {
  // UTC instants preserve source offsets and DST without a floating-time assumption.
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TelecomAI Lab//Talks and Seminars//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-TIMEZONE:${event.timeZone}`, "BEGIN:VEVENT", `UID:talk-${event.id}@telecomailab.github.io`, `DTSTAMP:${utc(generatedAt)}`, `DTSTART:${utc(event.date)}`, `DTEND:${utc(event.endDate)}`, `SUMMARY:${escapeText(event.title)}`, `LOCATION:${escapeText(event.location)}`, `DESCRIPTION:${escapeText(event.description)}`, ...(event.eventWebsite ? [`URL:${event.eventWebsite}`] : []), "END:VEVENT", "END:VCALENDAR"];
  return lines.map(fold).join("\r\n") + "\r\n";
}
