import { calendarIsUpcoming } from "../lib/talk-time";

const actions = [...document.querySelectorAll<HTMLDetailsElement>("[data-calendar-actions]")];
function refreshCalendars() {
  for (const action of actions) {
    action.hidden = !calendarIsUpcoming(action.dataset.calendarStart ?? "");
    if (action.hidden) action.open = false;
  }
}
refreshCalendars();
window.addEventListener("pageshow", refreshCalendars);
window.addEventListener("focus", refreshCalendars);
document.addEventListener("visibilitychange", refreshCalendars);
// Recheck open pages too, so a calendar menu cannot remain available after the start.
setInterval(refreshCalendars, 1000);
