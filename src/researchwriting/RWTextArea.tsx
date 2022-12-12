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
import { PageContentCacheContext } from "./PageContentCache";
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
  const previousLength = usePrevious(content.length) ?? 0;

  useEffect(() => {
    if (content.length > previousLength + 5) {
      console.log("Content got a lot longer", { previousLength, content });
      console.log("Moving cursor to end");
      ref.current!.focus();
      ref.current!.setSelectionRange(content.length, content.length);
    }
    console.log("Content length:", content.length);
  }, [previousLength, content]);

  useEffect(() => {
    setDropping(false);
  }, [draggedUrl]);

  useEffect(() => {
    if (draggedUrl !== null) {
      request(draggedUrl);
    }
  }, [draggedUrl, request]);

  const onDrop: MouseEventHandler = useCallback(
    (e) => {
      console.log("Dropped", draggedUrl);
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
          setContent(text);
          ref.current!.setSelectionRange(text.length, text.length);
        } catch (e) {
          console.error(e);
        }
        setDropping(false);
      }

      run();
    },
    [content, cursor, draggedUrl, request]
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
