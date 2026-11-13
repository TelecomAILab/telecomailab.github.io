/** Calendar actions are available strictly before the supplied start instant. */
export const calendarIsUpcoming = (date: string, now = Date.now()) => date.includes("T") && Number.isFinite(Date.parse(date)) && Date.parse(date) > now;
