import { useCallback, useMemo, useState } from "react";
import AugmentedTextarea from "./AugmentedTextarea";
import EventLoggingProvider from "./EventLogging";
import getSuggestions from "./getSuggestions";
import PageContentCacheProvider from "./PageContentCache";
import ResearchWritingContext, {
  SelectionRange,
  Suggestion
} from "./ResearchWritingContext";
import RevisionsPanel from "./RevisionsPanel";

function textboxGenerationStatusText(status: string) {
  return status === "pending"
    ? "AI is writing"
    : status === "error"
    ? "AI failed to generate"
    : "AI is ready";
}

function features() {
  return (
    <>
      <b>Features</b>
      <ul>
        <li>
          Press <code>ctrl + enter</code> to generate the next few words
        </li>
        <li>
          Select text and press <code>ctrl + enter</code> to revise it
        </li>
      </ul>
    </>
  );
}

export default function ResearchWriting() {
  const [textboxGenerationStatus, setTextboxGenerationStatus] = useState<
    "idle" | "pending" | "error"
  >("idle");
  const [content, setContent] = useState("");
  const [selection, setSelection] = useState<SelectionRange>({
    start: 0,
    end: 0,
  });
  const [inRevisingMode, setInRevisingMode] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const value = useMemo(
    () => ({
      textboxGenerationStatus,
      setTextboxGenerationStatus,
      content,
      setContent,
      selection,
      setSelection,
      inRevisingMode,
      setInRevisingMode,
      suggestions,
      setSuggestions,
    }),
    [content, inRevisingMode, selection, suggestions, textboxGenerationStatus]
  );

  const createSuggestions = useCallback(async () => {
    const suggestions = await getSuggestions(content);
    const compiledSuggestions = [];
    for (const suggestion of suggestions) {
      const startIndex = content.indexOf(suggestion.text);
      compiledSuggestions.push({
        startIndex,
        endIndex: startIndex + suggestion.text.length,
        content: suggestion.content,
      });
    }
    setSuggestions(compiledSuggestions);
  }, [content]);

  return (
    <ResearchWritingContext.Provider value={value}>
      <EventLoggingProvider>
        <PageContentCacheProvider>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              minHeight: "100vh",
              padding: "1rem",
            }}
          >
            <h1 style={{ textAlign: "center" }}>write.ai</h1>
            <button onClick={createSuggestions}>Create suggestions</button>
            {inRevisingMode && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    maxHeight: "calc(100% - 4rem)",
                    width: "min(40rem, calc(100% - 4rem))",
                    transform: "translate(-50%, -50%)",
                    top: "50%",
                    left: "50%",
                    backgroundColor: "white",
                    padding: "2rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <button
                    onClick={() => setInRevisingMode(false)}
                    className="link"
                    style={{ margin: "0.5rem 0" }}
                  >
                    Close window
                  </button>
                  <RevisionsPanel />
                </div>
              </div>
            )}
            <div
              style={{
                position: "relative",
                margin: "0 auto",
                width: "8.5in",
                height: "11in",
                overflow: "hidden",
              }}
            >
              <AugmentedTextarea />
            </div>
          </div>
        </PageContentCacheProvider>
      </EventLoggingProvider>
    </ResearchWritingContext.Provider>
  );
}
