import { useState } from "react";
import { api, Page } from "../api";
import DefaultLayout from "../DefaultLayout";
import ChatPanel, { ChatEventType } from "./ChatPanel";
import EventLoggingProvider from "./EventLogging";
import PageContentCacheProvider from "./PageContentCache";
import ResearchWritingContext from "./ResearchWritingContext";
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

  return (
    <ResearchWritingContext.Provider
      value={{ pages, setPages, readingUrl, setReadingUrl, chat, setChat }}
    >
      <EventLoggingProvider>
        <PageContentCacheProvider>
          <DefaultLayout white fullscreen>
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
                  flex: 1,
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
