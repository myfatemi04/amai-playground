import { useMemo, useState } from "react";
import { api, Page } from "../api";
import DefaultLayout from "../DefaultLayout";
import ChatPanel, { ChatEventType } from "./ChatPanel";
import EventLoggingProvider from "./EventLogging";
import PageContentCacheProvider from "./PageContentCache";
import ResearchWritingContext, {
  SelectionRange,
} from "./ResearchWritingContext";
import RevisionsPanel from "./RevisionsPanel";
import RWWritingPanel from "./WritingPanel";

// eslint-disable-next-line
async function getCompletionBasedOnSearchResult(
  knowledge: string,
  context: string
) {
  const { completion } = await api("generate_for_prompt", {
    prompt_id: "639639a9fe3937783e18ce52",
    variables: { knowledge, context },
  });
  return completion as string;
}

// eslint-disable-next-line
async function getSearchQueries(question: string): Promise<string[]> {
  const { completion } = await api("generate_for_prompt", {
    prompt_id: "63962e8cfe3937783e18ce51",
    variables: { question },
  });
  return completion.map((completion: string) => {
    if (completion.startsWith(`"`) && completion.endsWith(`"`)) {
      return completion.slice(1, completion.length - 1);
    } else {
      return completion;
    }
  });
}

/*
Creates a word processor which is augmented with AI problem-solving tools.
*/
export default function ResearchWriting() {
  const [pages, setPages] = useState([] as Page[]);
  const [chat, setChat] = useState([] as ChatEventType[]);
  const [readingUrl, setReadingUrl] = useState<string | null>(null);
  const [textboxGenerationStatus, setTextboxGenerationStatus] = useState<
    "idle" | "pending" | "error"
  >("idle");
  const [content, setContent] = useState("");
  const [selection, setSelection] = useState<SelectionRange>({
    start: 0,
    end: 0,
  });
  const [inRevisingMode, setInRevisingMode] = useState(false);

  const value = useMemo(
    () => ({
      pages,
      setPages,
      readingUrl,
      setReadingUrl,
      chat,
      setChat,
      textboxGenerationStatus,
      setTextboxGenerationStatus,
      content,
      setContent,
      selection,
      setSelection,
      inRevisingMode,
      setInRevisingMode,
    }),
    [
      chat,
      content,
      inRevisingMode,
      pages,
      readingUrl,
      selection,
      textboxGenerationStatus,
    ]
  );

  return (
    <ResearchWritingContext.Provider value={value}>
      <EventLoggingProvider>
        <PageContentCacheProvider>
          <DefaultLayout white fullscreen>
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
            <div style={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
              <div
                style={{
                  flex: 3,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <RWWritingPanel />
              </div>
              <div
                style={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  padding: "0 2rem",
                  overflowY: "auto",
                }}
              >
                <ChatPanel />
              </div>
            </div>
          </DefaultLayout>
        </PageContentCacheProvider>
      </EventLoggingProvider>
    </ResearchWritingContext.Provider>
  );
}
