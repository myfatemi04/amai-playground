import {
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import { api, SearchResults } from "../api";
import { EventLoggingContext } from "./EventLogging";
import { TextareaContext } from "./TextareaProvider";

async function getSearchResults(query: string): Promise<SearchResults> {
  const { result } = await api("retrieval_enhancement", {
    backend: "bing",
    query,
  });
  return { ...result, query };
}

const SEARCH_TIMEOUT_MS = 2000;

export default function RWResearchPanel({
  setDraggedUrl,
}: {
  setDraggedUrl: (url: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>();
  const [status, setStatus] = useState<"idle" | "pending" | "errored">("idle");
  const { logEvent, logError } = useContext(EventLoggingContext);
  const { content } = useContext(TextareaContext);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    const timeout = setTimeout(async () => {
      setStatus("pending");
      try {
        logEvent({
          type: "search",
          query,
          content,
        });
        const results = await getSearchResults(query);
        setResults(results);
        setStatus("idle");
      } catch (e) {
        logError(e);
        setStatus("errored");
      }
    }, SEARCH_TIMEOUT_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [logEvent, query, content, logError]);

  const onDragEnd: MouseEventHandler = useCallback(
    (e) => e.preventDefault(),
    []
  );

  return (
    <>
      <h3 style={{ margin: "0.5rem 0" }}>Research Panel</h3>
      <input
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
      />
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
        {results?.pages.map((result) => (
          <div
            key={result.url}
            style={{ cursor: "pointer" }}
            onDragStart={() => setDraggedUrl(result.url)}
            onDragEnd={onDragEnd}
            draggable
          >
            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: "bold" }}
            >
              {result.title}
            </a>
            <p>{result.snippet}</p>
          </div>
        ))}
      </div>
    </>
  );
}
