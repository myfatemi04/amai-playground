import {
  CSSProperties,
  Fragment,
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

export default function AugmentedTextarea({
  style = {},
}: {
  style?: CSSProperties;
}) {
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
    suggestions,
    setSuggestions,
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

  const [hoveredSuggestion, setHoveredSuggestion] = useState(-1);

  useEffect(() => {
    setHoveredSuggestion(-1);
  }, [suggestions]);

  const scrollbarWidth = ref.current
    ? // Detect whether there is a scrollbar or not.
      ref.current.scrollHeight > ref.current.clientHeight
      ? ref.current.offsetWidth - ref.current.clientWidth
      : 0
    : 0;

  const scrollHeight = useScrollHeight(ref.current);

  useEffect(() => {
    if (selectionRange.start === selectionRange.end) {
      // Set the hovered suggestion to the one that the cursor is currently on.
      const hoveredSuggestionIndex = suggestions.findIndex(
        ({ startIndex, endIndex }) =>
          selectionRange.start >= startIndex && selectionRange.start <= endIndex
      );
      setHoveredSuggestion(hoveredSuggestionIndex);
    }
  }, [selectionRange, suggestions]);

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
        }}
      >
        {suggestions.map(
          ({ startIndex, endIndex, content: suggestionContent }, i) => {
            const previousEndIndex = i === 0 ? 0 : suggestions[i - 1].endIndex;
            const contentAfterPreviousSuggestion = content.slice(
              previousEndIndex,
              startIndex
            );
            const contentForThisSuggestion = content.slice(
              startIndex,
              endIndex
            );

            return (
              <Fragment key={endIndex}>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: textareaStyle.fontFamily,
                    display: "inline",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {contentAfterPreviousSuggestion}
                </pre>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: textareaStyle.fontFamily,
                    display: "inline",
                    whiteSpace: "pre-wrap",
                    color: "black",
                    backgroundClip: "text",
                    background:
                      "linear-gradient(90deg, #00ff00, rgba(0, 255, 0, 0.2))",
                    cursor: "pointer",
                    // textDecoration: "underline",
                    position: "relative",
                    // Must be re-enabled because the enclosing element has pointerEvents: "none"
                    // pointerEvents: "auto",
                  }}
                  // onMouseOver={() => setHoveredSuggestion(i)}
                  // onMouseOut={() => setHoveredSuggestion(-1)}
                >
                  {contentForThisSuggestion}

                  {hoveredSuggestion === i && (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0px",
                          transform: "translateY(calc(100% + 10px))",
                          backgroundColor: "rgba(255, 255, 255, 1)",
                          color: "black",
                          zIndex: 2,
                          fontWeight: "bold",
                          padding: "0.5rem",
                          border: "1px solid black",
                          borderRadius: "0.25rem",
                          pointerEvents: "none",
                        }}
                      >
                        {suggestionContent}
                      </div>
                    </>
                  )}
                </pre>
              </Fragment>
            );
          }
        )}
        {
          <pre
            style={{
              // visibility: "hidden",
              margin: 0,
              fontFamily: textareaStyle.fontFamily,
              display: "inline",
              whiteSpace: "pre-wrap",
            }}
          >
            {content.slice(suggestions[suggestions.length - 1]?.endIndex || 0)}
            {/* {JSON.stringify(suggestions)} */}
          </pre>
        }
      </div>
      <textarea
        disabled={status === "pending"}
        ref={ref}
        value={content}
        rows={40}
        cols={80}
        style={{
          ...textareaStyle,
          color: "transparent",
          caretColor: textareaStyle.color || "black",
          backgroundColor: "transparent",
          zIndex: 0,
        }}
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
