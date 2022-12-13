import {
  CSSProperties,
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../api";
import usePrevious from "../usePrevious";
import { EventLoggingContext } from "./EventLogging";
import { PageContentCacheContext } from "./PageContentCache";
import { TextareaContext } from "./TextareaProvider";
import useCursor from "./useCursor";
import useScrollHeight from "./useScrollHeight";
import useSuggestion from "./useSuggestion";

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

export default function RWTextArea({
  style = {},
  draggedUrl,
}: {
  style?: CSSProperties;
  draggedUrl: string | null;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState<string>("");
  const cursor = useCursor(ref.current);
  const { request } = useContext(PageContentCacheContext);
  const { suggestion, status } = useSuggestion(content.slice(0, cursor + 1));
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
        try {
          const continuation = await continueWithRetrievedPage(
            draggedUrlContent.title,
            draggedUrlContent.textContent,
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
            snippet: draggedUrlContent.textContent,
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
    [draggedUrl, request, content, cursor, logEvent, logError]
  );

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
        {suggestion && !dropping && (
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
            e.key === "ArrowRight" &&
            status === "idle" &&
            suggestion !== null
          ) {
            e.preventDefault();
            setContent(
              content.slice(0, cursor + 1) +
                suggestion +
                content.slice(cursor + 1)
            );
          }
        }}
      />
    </>
  );
}