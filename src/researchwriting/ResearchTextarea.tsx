import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../api";
import { EventLoggingContext } from "./EventLogging";
import ResearchWritingContext from "./ResearchWritingContext";
import useScrollHeight from "./useScrollHeight";
import useSelectionRange from "./useSelectionRange";

// eslint-disable-next-line
async function continueWithRetrievedPage(
  title: string,
  content: string,
  context: string
) {
  const { completion } = await api("generate_for_prompt", {
    prompt_id: "639695953ee71dbb54be8165",
    variables: {
      title,
      content,
      context: context.slice(Math.max(0, context.length - 1000)),
    },
  });
  return completion;
}

export default function RWTextArea({ style = {} }: { style?: CSSProperties }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const selectionRange = useSelectionRange(ref.current);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const {
    textboxGenerationStatus: status,
    setTextboxGenerationStatus: setStatus,
    content,
    setContent,
    setSelection,
    setInRevisingMode,
  } = useContext(ResearchWritingContext);

  const textareaStyle: CSSProperties = {
    fontFamily: "sans-serif",
    fontSize: "1rem",
    padding: "1rem",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: "absolute",
    border: "1px solid black",
    ...(style || {}),
  };
  const { logError } = useContext(EventLoggingContext);

  // Publish cursor and content to the context
  useEffect(() => setContent(content), [content, setContent]);
  useEffect(() => setSelection(selectionRange), [selectionRange, setSelection]);

  const createSuggestion = useCallback(async () => {
    const prompt = content.slice(0, selectionRange.end + 1);

    setStatus("pending");

    if (prompt.length === 0) {
      setSuggestion(null);
      setStatus("idle");
      return;
    }

    try {
      const { completion } = await api("generate_for_prompt", {
        prompt_id: "63bf39f45117bd92a289699f",
        variables: {
          context: prompt,
        },
      });
      setSuggestion(completion);
      setStatus("idle");
    } catch (error) {
      logError(error);
      setStatus("error");
    }

    setTimeout(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(
        selectionRange.end + 1,
        selectionRange.end + 1
      );
    }, 100);
  }, [content, selectionRange, logError, setStatus]);

  const scrollbarWidth = ref.current
    ? ref.current.offsetWidth - ref.current.clientWidth
    : 0;

  const scrollHeight = useScrollHeight(ref.current);

  return (
    <>
      <div
        style={{
          ...textareaStyle,
          borderColor: "transparent",
          zIndex: 1,
          pointerEvents: "none",
          right: scrollbarWidth,
          top: -scrollHeight,
          overflow: "hidden",
        }}
      >
        <pre
          style={{
            visibility: "hidden",
            margin: 0,
            fontFamily: textareaStyle.fontFamily,
            display: "inline",
            whiteSpace: "pre-wrap",
          }}
        >
          {content.slice(0, selectionRange.end)}
        </pre>
        <pre
          style={{
            color: "grey",
            fontStyle: "italic",
            margin: 0,
            fontFamily: textareaStyle.fontFamily,
            display: "inline",
            whiteSpace: "pre-wrap",
          }}
        >
          {suggestion || (suggestion !== null && "(no suggestion)")}
        </pre>
      </div>
      <textarea
        disabled={status === "pending"}
        ref={ref}
        value={content}
        rows={40}
        cols={80}
        style={textareaStyle}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (
            (e.key === "ArrowRight" || e.key === "Tab") &&
            status === "idle" &&
            suggestion !== null
          ) {
            e.preventDefault();
            setContent(
              content.slice(0, selectionRange.end + 1) +
                suggestion +
                content.slice(selectionRange.end + 1)
            );
            setSuggestion(null);
          } else if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            if (selectionRange.start !== selectionRange.end) {
              setInRevisingMode(true);
            } else {
              createSuggestion();
            }
          } else if (e.key === "Escape") {
            setSuggestion(null);
          }
        }}
      />
    </>
  );
}
