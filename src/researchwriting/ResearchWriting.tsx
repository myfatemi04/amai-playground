import { useState } from "react";
import { api, Page } from "../api";
import DefaultLayout from "../DefaultLayout";
import EventLoggingProvider from "./EventLogging";
import PageContentCacheProvider from "./PageContentCache";
import ResearchWritingContext from "./ResearchWritingContext";
import RWWritingPanel from "./WritingPanel";

export async function getCompletionBasedOnSearchResult(
  knowledge: string,
  context: string
) {
  const { completion } = await api("generate_for_prompt", {
    prompt_id: "639639a9fe3937783e18ce52",
    variables: { knowledge, context },
  });
  return completion as string;
}

export async function getSearchQueries(question: string): Promise<string[]> {
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
  const [readingUrl, setReadingUrl] = useState<string | null>(null);

  return (
    <ResearchWritingContext.Provider
      value={{ pages, setPages, readingUrl, setReadingUrl }}
    >
      <EventLoggingProvider>
        <PageContentCacheProvider>
          <DefaultLayout white>
            <RWWritingPanel />
          </DefaultLayout>
        </PageContentCacheProvider>
      </EventLoggingProvider>
    </ResearchWritingContext.Provider>
  );
}
