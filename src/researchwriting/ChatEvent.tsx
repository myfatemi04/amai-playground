import { ReactNode } from "react";
import { ChatEventType } from "./ChatPanel";
import { Source } from "./ResearchPanel";

export default function ChatEvent({ event }: { event: ChatEventType }) {
  let content: ReactNode;
  if (event.type === "user") {
    content = (
      <>
        <b style={{ fontSize: "0.75rem" }}>USER</b>
        <br />
        {event.content}
      </>
    );
  } else if (event.type === "assistant") {
    if (event.content.startsWith("!Say ")) {
      content = (
        <>
          <b style={{ fontSize: "0.75rem" }}>AI</b>
          <br />
          {event.content.slice("!Say ".length)}
        </>
      );
    } else if (event.content.startsWith("!Search ")) {
      content = (
        <>
          <b style={{ fontSize: "0.75rem" }}>SEARCH</b>
          <br />
          Assistant searches for <i>{event.content.slice("!Search ".length)}</i>
        </>
      );
    } else if (event.content.startsWith("!Done")) {
      content = <i>Assistant is done with response.</i>;
    }
  } else if (event.type === "search") {
    content = (
      <>
        <b style={{ fontSize: "0.75rem" }}>SEARCH RESULTS</b>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {event.content.pages.map((page) => (
            <Source source={page} key={page.url} />
          ))}
        </div>
      </>
    );
  }

  return <div style={{ padding: "0.5rem 0" }}>{content}</div>;
}
