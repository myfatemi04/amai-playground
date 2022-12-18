import { InteractionEventType } from "./Interactive";

export default function InteractionEvent({
  event,
}: {
  event: InteractionEventType;
}) {
  return (
    <div style={{ padding: "0.5rem", display: "flex", alignItems: "center" }}>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          margin: 0,
          fontFamily: "Arial",
          fontSize: "0.875rem",
        }}
      >
        {event.type === "assistant" ? (
          event.content.startsWith("!Say ") ? (
            <>[Assistant] {event.content.slice("!Say ".length)}</>
          ) : event.content.startsWith("!Search ") ? (
            <>
              Assistant searches for{" "}
              <i>{event.content.slice("!Search ".length)}</i>
            </>
          ) : event.content.startsWith("!Done") ? (
            <>
              <i>Assistant is done with response.</i>
            </>
          ) : (
            <>[unknown event] {JSON.stringify(event)}</>
          )
        ) : event.content.startsWith("User: ") ? (
          <>[User] {event.content.slice("User: ".length)}</>
        ) : event.content.startsWith("Search results:") ? (
          <>
            [Search results] Hidden.
            {event.content.slice("Search results:".length)}
          </>
        ) : (
          <>[unknown event] {JSON.stringify(event)}</>
        )}
      </pre>
    </div>
  );
}
