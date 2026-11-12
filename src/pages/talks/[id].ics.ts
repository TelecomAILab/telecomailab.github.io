import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { authorName, getEditorialContext } from "../../lib/editorial";
import { calendarEvent, eventIcs } from "../../lib/calendar";

export async function getStaticPaths() {
  const context = await getEditorialContext();
  return (await getCollection("talks")).flatMap((talk) => {
    const event = calendarEvent({ ...talk.data, id: talk.id }, authorName(talk.data.speaker, context));
    return event ? [{ params: { id: talk.id }, props: { event } }] : [];
  });
}

export const GET: APIRoute = ({ props }) => new Response(eventIcs(props.event), {
  headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="talk-${props.event.id}.ics"` },
});
