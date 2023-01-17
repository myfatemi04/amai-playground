import { useState, useContext, useCallback, useEffect, useRef } from "react";
import { api, getSearchResults, SearchResults } from "../api";
import ChatEvent from "./ChatEvent";
import ResearchWritingContext from "./ResearchWritingContext";

export type ChatEventType = {
  time: number;
} & (
  | {
      type: "assistant";
      prompt: string;
      content: string;
    }
  | {
      type: "search";
      query: string;
      content: SearchResults;
    }
  | {
      type: "user";
      content: string;
    }
);

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const { chat, setChat } = useContext(ResearchWritingContext);
  const eventContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateNext = useCallback(async () => {
    let serializedPastEvents = chat
      .map((event) => {
        if (event.type === "assistant") {
          return "Assistant: " + event.content;
        } else if (event.type === "search") {
          return (
            `Search results for "${event.query}":\n` +
            event.content.pages.map(
              (page) => `Page "${page.title}": "${page.snippet}"`
            )
          );
        } else if (event.type === "user") {
          return "User: " + event.content;
        }
        console.warn("Unknown event type", event);
        return null;
      })
      .join("\n\n");
    serializedPastEvents = serializedPastEvents.slice(
      Math.max(0, serializedPastEvents.length - 4096)
    );
    setGenerating(true);
    // Serialize past events.
    let completion: string;
    try {
      completion =
        "Assistant: !" +
        (
          await api("generate_for_prompt", {
            prompt_id: "639e6f8b96c0c9a18edd87c9",
            variables: {
              previous_context: serializedPastEvents + "\n\n",
            },
          })
        ).completion;
    } catch (e) {
      console.error(e);
      setGenerating(false);
      return;
    }
    let resultingEvents: ChatEventType[] = [
      {
        type: "assistant",
        prompt: serializedPastEvents,
        content: completion.slice("Assistant: ".length),
        time: Date.now(),
      },
    ];
    // Move "!Search" completions into separate events
    if (completion.includes("\n!Search")) {
      const parts = completion.split("\n!Search");
      resultingEvents = [
        {
          type: "assistant",
          prompt: serializedPastEvents,
          content: parts[0],
          time: Date.now(),
        },
        {
          type: "assistant",
          prompt: serializedPastEvents,
          content: "!Search" + parts[1],
          time: Date.now(),
        },
      ];
    } else if (completion.includes("!Done")) {
      const parts = completion.split("!Done");
      console.log("Result included '!Done', splitting");
      console.log({ parts });
      resultingEvents = [
        {
          type: "assistant",
          prompt: serializedPastEvents,
          content: parts[0].slice("Assistant: ".length).trim(),
          time: Date.now(),
        },
        {
          type: "assistant",
          prompt: serializedPastEvents,
          content: "!Done",
          time: Date.now(),
        },
      ];
    }
    setChat((chat) => [...chat, ...resultingEvents]);
    setGenerating(false);
    textareaRef.current?.focus();
  }, [chat, setChat]);
  // Keep generating until we reach the assistant's '!Done' sequence.
  useEffect(() => {
    if (chat.length === 0) {
      // Fine.
      return;
    }
    const mostRecent = chat[chat.length - 1];
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
          setChat((chat) => [
            ...chat,
            {
              type: "search",
              time: Date.now(),
              query,
              content: results,
            },
          ]);
        });
        return;
      }
    }
    // Generate next
    generateNext();
  }, [chat, generateNext, setChat]);
  useEffect(() => {
    if (eventContainerRef.current) {
      eventContainerRef.current.scrollTop =
        eventContainerRef.current.scrollHeight;
    }
  }, [chat.length]);

  return (
    <>
      <h3>AI Assistant</h3>
      <div style={{ flexGrow: 1, overflowY: "auto" }} ref={eventContainerRef}>
        {chat.map(
          (event, i) =>
            (event.type !== "assistant" ||
              !event.content.startsWith("!Done")) && <ChatEvent event={event} />
        )}
      </div>
      {generating && (
        <b style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>
          AI is typing...
        </b>
      )}
      <textarea
        style={{
          fontFamily: "inherit",
          fontSize: "0.875rem",
          padding: "1rem",
          minHeight: "2rem",
          marginTop: "1rem",
        }}
        value={input}
        ref={textareaRef}
        onChange={(e) => setInput(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim().length > 0) {
              setChat([
                ...chat,
                {
                  content: input.trim(),
                  time: Date.now(),
                  type: "user",
                },
              ]);
              setInput("");
            }
          }
        }}
        disabled={generating}
      />
    </>
  );
}
