import {
  CSSProperties,
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { api } from "../api";
import { EventLoggingContext } from "./EventLogging";
import { PageContentCacheContext } from "./PageContentCache";
import ResearchWritingContext from "./ResearchWritingContext";
import { TextareaContext } from "./TextareaProvider";
import useCursor from "./useCursor";
import useScrollHeight from "./useScrollHeight";

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
  const [content, setContent] = useState<string>("");
  const cursor = useCursor(ref.current);
  const { request } = useContext(PageContentCacheContext);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const { draggedUrl, setDropHistory } = useContext(ResearchWritingContext);

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
  const [dropping, setDropping] = useState(false);
  const { setContent: publishContent, setCursor: publishCursor } =
    useContext(TextareaContext);
  const { logEvent, logError } = useContext(EventLoggingContext);

  // Publish cursor and content to the context
  useEffect(() => publishContent(content), [content, publishContent]);
  useEffect(() => publishCursor(cursor), [cursor, publishCursor]);

  useEffect(() => setDropping(false), [draggedUrl]);

  useEffect(() => {
    if (draggedUrl !== null) {
      request(draggedUrl);
    }
  }, [draggedUrl, request]);

  const onDrop: MouseEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      async function run() {
        if (draggedUrl === null) {
          console.warn("onDrop called, but draggedUrl is null");
          return;
        }
        setDropping(true);
        const draggedUrlContent = await request(draggedUrl);
        if (draggedUrlContent === null) {
          console.warn("onDrop called, but content is null");
          return;
        }
        console.log(draggedUrlContent);
        setDropHistory((history) => [
          ...history,
          { url: draggedUrl, title: draggedUrlContent.title },
        ]);
        try {
          const continuation = await continueWithRetrievedPage(
            draggedUrlContent.title,
            draggedUrlContent.content,
            content.slice(0, cursor + 1)
          );
          const text =
            content.slice(0, cursor + 1) +
            continuation +
            content.slice(cursor + 1);
          logEvent({
            type: "drag",
            url: draggedUrl,
            title: draggedUrlContent.title,
            snippet: draggedUrlContent.content,
            content,
            cursor,
          });
          setContent(text);
          ref.current!.focus();
          ref.current!.setSelectionRange(
            cursor + continuation.length,
            cursor + continuation.length
          );
        } catch (e) {
          logError(e);
        }
        setDropping(false);
      }

      run();
    },
    [draggedUrl, request, setDropHistory, content, cursor, logEvent, logError]
  );

  const createSuggestion = useCallback(async () => {
    const prompt = content.slice(0, cursor + 1);

    setStatus("pending");

    if (prompt.length === 0) {
      setSuggestion(null);
      setStatus("idle");
      return;
    }

    try {
      const { completion } = await api("generate_completion", {
        prompt,
      });
      setSuggestion(completion);
      setStatus("idle");
    } catch (error) {
      logError(error);
      setStatus("error");
    }
  }, [content, cursor, logError]);

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
        {!dropping && (
          <>
            <pre
              style={{
                visibility: "hidden",
                margin: 0,
                fontFamily: textareaStyle.fontFamily,
                display: "inline",
                whiteSpace: "pre-wrap",
              }}
            >
              {content.slice(0, cursor)}
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
          </>
        )}
      </div>
      <textarea
        ref={ref}
        value={content}
        rows={40}
        cols={80}
        style={textareaStyle}
        // Allow dragover event
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (
            (e.key === "ArrowRight" || e.key === "Tab") &&
            status === "idle" &&
            suggestion !== null
          ) {
            e.preventDefault();
            setContent(
              content.slice(0, cursor + 1) +
                suggestion +
                content.slice(cursor + 1)
            );
            setSuggestion(null);
          } else if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            createSuggestion();
          } else if (e.key === "Escape") {
            setSuggestion(null);
          }
        }}
      />
    </>
  );
}
