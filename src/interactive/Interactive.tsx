import { useCallback, useEffect, useRef, useState } from "react";
import { api, getSearchResults } from "../api";
import Positioning from "../Positioning";
import InteractionEvent from "./InteractionEvent";

export interface InteractionEventType {
  time: number;
  type: "assistant" | "external";
  content: string;
}

export default function Interactive() {
  const [pastEvents, setPastEvents] = useState<InteractionEventType[]>([]);
  const [textbox, setTextbox] = useState("");
  const eventContainerRef = useRef<HTMLDivElement>(null);
  const submit = useCallback(async () => {
    setTextbox("");
    setPastEvents((pastEvents) => [
      ...pastEvents,
      {
        type: "external" as const,
        content: "User: " + textbox,
        time: Date.now(),
      },
    ]);
  }, [textbox]);
  const generateNext = useCallback(async () => {
    const serializedPastEvents = pastEvents
      .map((event) => {
        if (event.type === "assistant") {
          return "Assistant: " + event.content;
        } else {
          if (event.content.startsWith("Search results:")) {
            return "Search results: <omitted>";
          } else {
            return event.content;
          }
        }
      })
      .join("\n\n");
    // Serialize past events.
    const completion: string =
      "Assistant: !" +
      (
        await api("generate_for_prompt", {
          prompt_id: "639e6f8b96c0c9a18edd87c9",
          variables: {
            previous_context: serializedPastEvents + "\n\n",
          },
        })
      ).completion;
    setPastEvents((pastEvents) => [
      ...pastEvents,
      {
        type: "assistant",
        content: completion.slice("Assistant: ".length),
        time: Date.now(),
      },
    ]);
  }, [pastEvents]);
  // Keep generating until we reach the assistant's '!Done' sequence.
  useEffect(() => {
    if (pastEvents.length === 0) {
      // Fine.
      return;
    }
    const mostRecent = pastEvents[pastEvents.length - 1];
    if (
      mostRecent.type === "assistant" &&
      mostRecent.content.startsWith("!Done")
    ) {
      // Reached base case
      return;
    }
    if (mostRecent.type === "assistant") {
      // Check if the assistant searched for something.
      if (mostRecent.content.startsWith("!Search ")) {
        const query = mostRecent.content.slice("!Search ".length);
        getSearchResults(query).then((results) => {
          setPastEvents((pastEvents) => [
            ...pastEvents,
            {
              type: "external",
              time: Date.now(),
              content:
                "Search results:\n" +
                results.pages
                  .map((page) => `"${page.title}": ${page.snippet}`)
                  .join("\n"),
            },
          ]);
        });
        return;
      }
    }
    // Generate next
    generateNext();
  }, [generateNext, pastEvents]);
  useEffect(() => {
    if (eventContainerRef.current) {
      eventContainerRef.current.scrollTop =
        eventContainerRef.current.scrollHeight;
    }
  }, [pastEvents.length]);

  return (
    <Positioning>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          flexGrow: 1,
          overflowY: "auto",
          marginBottom: "1rem",
        }}
        ref={eventContainerRef}
      >
        {/* Create an <InteractionEvent /> component for all of pastEvents */}
        {pastEvents.map((event) => (
          <InteractionEvent event={event} key={event.time} />
        ))}
      </div>
      <div style={{ display: "flex", marginBottom: "2rem" }}>
        <input
          type="text"
          value={textbox}
          onChange={(e) => setTextbox(e.target.value)}
          style={{ flexGrow: 1 }}
          onKeyDown={(e) => {
            if (e.code === "Enter" && textbox.length > 0) {
              submit();
            }
          }}
        />
        <button
          style={{ marginLeft: "1rem" }}
          onClick={submit}
          disabled={textbox.length === 0}
        >
          Submit
        </button>
      </div>
    </Positioning>
  );
}
