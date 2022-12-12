import { useEffect, useState } from "react";
import { api } from "../api";
import Header from "../Header";
import PageContentCacheProvider from "./PageContentCache";
import RWResearchPanel from "./RWResearchPanel";
import RWTextArea from "./RWTextArea";

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
  const [draggedUrl, setDraggedUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log({ draggedUrl });
  }, [draggedUrl]);

  return (
    <PageContentCacheProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          height: "100vh",
          width: "calc(min(100vw, max(80vw, 40rem)))",
          boxSizing: "border-box",
          margin: "0 auto",
        }}
      >
        <Header>AugmateAI Research Writing</Header>
        {/*
				minHeight: 0 might not seem to make sense here, but by default, it's minHeight: auto. This causes overflows of the flex box.
				More info can be found here: https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container

				flex-grow ensures that the element stretches to the full width (or height) of the enclosing flexbox.
			*/}
        <div style={{ display: "flex", minHeight: 0, flexGrow: 1 }}>
          <div
            style={{
              flex: 4,
              display: "flex",
              flexDirection: "column",
              paddingRight: "2rem",
            }}
          >
            <h3 style={{ margin: "0.5rem 0" }}>Writing Panel</h3>
            <span style={{ fontSize: "0.875rem" }}>
              Powered by large language models. See the homepage:{" "}
              <a href="https://augmateai.michaelfatemi.com/">AugmateAI</a>
              <br />
              Developed by Michael Fatemi <br />
              <br />
              <b>Usage</b>
              <ul style={{ marginTop: 0 }}>
                <li>
                  Start typing anything, and suggestions will appear. Press{" "}
                  <code>tab</code> or <code>right arrow</code> to complete them.
                </li>
                <li>
                  You can incorporate information from outside sources now!
                  Whenever you want to fill in information from another website,
                  type <code>({"{your question}"}?)</code>, wait a moment, and
                  hover over a search result to preview what the completion will
                  look like. You can click the result or press <code>tab</code>{" "}
                  or <code>right arrow</code> to accept it.
                </li>
              </ul>
            </span>
            <div style={{ position: "relative", height: "100%", flexGrow: 1 }}>
              <RWTextArea draggedUrl={draggedUrl} />
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <RWResearchPanel setDraggedUrl={setDraggedUrl} />
          </div>
        </div>
      </div>
    </PageContentCacheProvider>
  );
}
