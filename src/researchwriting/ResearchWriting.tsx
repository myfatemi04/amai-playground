import { Readability } from "@mozilla/readability";
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../api";

interface SearchResultsSuggestionCache {
  [url: string]:
    | {
        parseable: true;
        pageContent: string;
        completion: string;
      }
    | {
        parseable: false;
        pageContent: null;
        completion: null;
      };
}

type Suggestion =
  | {
      type: "text";
      text: string;
      position: number;
    }
  | {
      type: "searchResults";
      results: SearchResults;
      cache: SearchResultsSuggestionCache;
      position: number;
      question: string;
    }
  | {
      type: "none";
      position: number;
    };

interface SearchResultPage {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResults {
  pages: SearchResultPage[];
  related_searches: string[];
  query: string;
}

const SUGGESTION_DELAY_MS = 2000;

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

async function getPageHtml(url: string) {
  const { result } = await api("retrieval_enhancement", {
    backend: "proxy",
    query: url,
  });
  return result as string;
}

function parse(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const reader = new Readability(document);
  const article = reader.parse();
  return article;
}

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

async function getSearchResults(query: string): Promise<SearchResults> {
  const { result } = await api("retrieval_enhancement", {
    backend: "bing",
    query,
  });
  return { ...result, query };
}

async function getKnowledgeFromPage(
  title: string,
  content: string,
  question: string
) {
  const { completion } = await api("generate_for_prompt", {
    prompt_id: "639641b7fe3937783e18ce53",
    variables: {
      title,
      content,
      question,
    },
  });
  return completion;
}

/*
Creates a word processor which is augmented with AI problem-solving tools.
*/
export default function ResearchWriting() {
  const [content, setContent] = useState("");
  const previousSuggestionContextRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const createSuggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [generationStatus, setGenerationStatus] = useState<
    null | "errored" | "pending"
  >(null);

  useEffect(() => {
    getPageHtml("https://en.wikipedia.org/wiki/Orange_juice").then((html) => {
      const article = parse(html);
      if (article) {
        const content = article.textContent.replace(/[\r\n]{3+}/g, "\n\n");
        console.log(content);
      } else {
        console.log("Article could not be parsed");
      }
    });
  }, []);

  const createSuggestion = useCallback(async () => {
    if (!textareaRef.current) {
      return;
    }
    const textarea = textareaRef.current;
    const selection = {
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
    };
    const before = textarea.value.slice(0, selection.selectionEnd);
    // Ignore if the user just pressed backspace a few times.
    if (previousSuggestionContextRef.current?.startsWith(before)) {
      return;
    }
    // If the textarea ends with "([question]?)", then generate search queries.
    setGenerationStatus("pending");
    try {
      if (before.endsWith("?)")) {
        const question = before.slice(
          before.lastIndexOf("(") + 1,
          before.length - 1
        );
        const queries = await getSearchQueries(question);
        const results = await getSearchResults(queries[0]);
        setSuggestion({
          type: "searchResults",
          results,
          position: selection.selectionEnd,
          cache: {},
          question,
        });
        setGenerationStatus(null);
        return;
      }

      const result = await api("generate_completion", { prompt: before });
      if (result.completion) {
        setSuggestion({
          type: "text",
          text: result.completion,
          position: selection.selectionEnd,
        });
        setGenerationStatus(null);
        previousSuggestionContextRef.current = before;
      } else {
        setSuggestion({
          type: "none",
          position: selection.selectionEnd,
        });
        setGenerationStatus(null);
      }
    } catch (e) {
      console.error(e);
      setGenerationStatus("errored");
    }
  }, []);

  const finishSuggestionWithSearchResult = useCallback(
    async (url: string) => {
      if (!suggestion) {
        console.error("No suggestion to finish");
        return;
      }
      if (suggestion.type !== "searchResults") {
        console.error("Suggestion is not based on search results");
        return;
      }
      const pageResult = suggestion.results.pages.find(
        (page) => page.url === url
      );
      if (!pageResult) {
        console.error("Page not found in search results");
        return;
      }
      if (!(url in suggestion.cache)) {
        let pageContent: string | null;
        try {
          pageContent = parse(await getPageHtml(url))?.textContent ?? null;
        } catch (e) {
          console.error(e);
          pageContent = null;
        }
        if (pageContent === null) {
          suggestion.cache[url] = {
            parseable: false,
            pageContent: null,
            completion: null,
          };
        } else {
          const knowledge = await getKnowledgeFromPage(
            pageResult.title,
            pageContent,
            suggestion.question
          );
          const contextWithQuestion = content.slice(0, suggestion.position);
          const contextWithoutQuestion = contextWithQuestion.slice(
            0,
            contextWithQuestion.lastIndexOf("(")
          );
          suggestion.cache[url] = {
            parseable: true,
            pageContent,
            completion: await getCompletionBasedOnSearchResult(
              knowledge,
              contextWithoutQuestion
            ),
          };
        }
      }

      const completionForURL = suggestion.cache[url]!;

      if (!completionForURL.parseable) {
        setSuggestion({
          type: "none",
          position: suggestion.position,
        });
        return;
      } else {
        setSuggestion({
          type: "text",
          text: completionForURL.completion,
          position: suggestion.position,
        });
      }
    },
    [content, suggestion]
  );

  const onTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (createSuggestionTimeoutRef.current) {
        clearTimeout(createSuggestionTimeoutRef.current);
      }
      createSuggestionTimeoutRef.current = setTimeout(
        createSuggestion,
        SUGGESTION_DELAY_MS
      );
    },
    [createSuggestion]
  );

  const onTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!textareaRef.current) {
        return;
      }
      const textarea = textareaRef.current;
      if (e.code === "Enter" && e.ctrlKey) {
        createSuggestion();
      } else if (
        (e.code === "Tab" || e.code === "ArrowRight") &&
        suggestion?.type === "text"
      ) {
        e.preventDefault();
        const before = textarea.value.slice(0, suggestion.position);
        const after = textarea.value.slice(suggestion.position);
        const text = before + suggestion.text + after;
        setContent(text);
        setSuggestion(null);
      } else {
        setSuggestion(null);
      }
    },
    [createSuggestion, suggestion]
  );

  const textareaStyle: CSSProperties = {
    fontFamily: "sans-serif",
    fontSize: "0.75rem",
    padding: "1rem",
    inset: 0,
    position: "absolute",
    border: "1px solid black",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        height: "100vh",
        width: "100vw",
        boxSizing: "border-box",
      }}
    >
      <h1>Research Writing Assistant</h1>
      {/*
				minHeight: 0 might not seem to make sense here, but by default, it's minHeight: auto. This causes overflows of the flex box.
				More info can be found here: https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container
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
          <span
            style={{
              textTransform: "uppercase",
              fontSize: "0.75rem",
              margin: "0.5rem 0",
            }}
          >
            {generationStatus &&
              {
                errored: "Error",
                pending: "Generating...",
              }[generationStatus]}
          </span>
          <div style={{ position: "relative", height: "100%", flexGrow: 1 }}>
            <div
              style={{
                ...textareaStyle,
                borderColor: "transparent",
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              {suggestion && (
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
                    {content.slice(0, suggestion.position)}
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
                    {
                      {
                        // @ts-ignore
                        text: suggestion.text,
                        none: "(no suggestion)",
                        searchResults: "(search results)",
                      }[suggestion.type]
                    }
                  </pre>
                </>
              )}
            </div>
            <textarea
              ref={textareaRef}
              onChange={onTextareaChange}
              onKeyDown={onTextareaKeyDown}
              value={content}
              rows={40}
              cols={80}
              style={textareaStyle}
            />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0.5rem 0" }}>Research Panel</h3>
          {/* <input
            type="text"
            onChange={(e) => setResearchPanelSearchText(e.target.value)}
            value={researchPanelSearchText}
          /> */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflowY: "auto",
              paddingRight: "1rem",
              margin: "1rem 0",
              boxSizing: "border-box",
              userSelect: "none",
            }}
          >
            {suggestion?.type === "searchResults" &&
              suggestion.results.pages.map((result) => (
                <div
                  key={result.url}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    finishSuggestionWithSearchResult(result.url);
                  }}
                >
                  <b>{result.title}</b>
                  <p>{result.snippet}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
