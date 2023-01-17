import { useCallback, useContext, useMemo, useState } from "react";
import { getSearchResults, Page, SearchResults } from "../api";
import { EventLoggingContext } from "./EventLogging";
import Reader from "./Reader";
import ResearchWritingContext from "./ResearchWritingContext";

function Source({ source }: { source: Page }) {
  const { pages, setPages, setReadingUrl } = useContext(ResearchWritingContext);
  const exists = pages.some((page) => page.url === source.url);

  return (
    <div key={source.url} style={{ padding: "0 0 1rem" }}>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="dark_a"
        style={{ fontWeight: "bold" }}
      >
        {source.title}
      </a>
      <p>{source.snippet}</p>
      <div style={{ display: "flex" }}>
        {/* Add or remove button */}
        {!exists ? (
          <button
            className="link"
            onClick={() => {
              setPages((pages) => [...pages, source]);
            }}
          >
            Add
          </button>
        ) : (
          <button
            className="link"
            onClick={() => {
              setPages((pages) =>
                pages.filter((page) => page.url !== source.url)
              );
            }}
          >
            Remove
          </button>
        )}
        {/* Read button */}
        <button
          className="link"
          style={{ marginLeft: "0.5rem" }}
          onClick={() => setReadingUrl(source.url)}
        >
          Read
        </button>
      </div>
    </div>
  );
}

function isUrl(maybeUrl: string) {
  try {
    new URL(maybeUrl);
    return true;
  } catch {
    return false;
  }
}

export default function RWResearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>();
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "pending" | "errored"
  >("idle");
  const { logError } = useContext(EventLoggingContext);
  const { pages, readingUrl, setReadingUrl } = useContext(
    ResearchWritingContext
  );

  const isUrl_ = useMemo(() => isUrl(searchQuery), [searchQuery]);

  const search = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }
    setSearchStatus("pending");
    try {
      setSearchResults(await getSearchResults(searchQuery));
      setSearchStatus("idle");
    } catch (e) {
      logError(e);
      setSearchStatus("errored");
    }
  }, [searchQuery, logError]);

  if (readingUrl != null) {
    return (
      <>
        <h3 style={{ margin: "0.5rem 0" }}>Reader</h3>
        <button
          onClick={() => {
            setReadingUrl(null);
          }}
          className="link"
          style={{ marginBottom: "1rem" }}
        >
          Back to list
        </button>
        <div
          style={{
            flexGrow: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Reader url={readingUrl} />
        </div>
      </>
    );
  }

  return (
    <>
      <h3 style={{ margin: "0.5rem 0" }}>Sources</h3>
      <div style={{ display: "flex", margin: "0.5rem 0" }}>
        <input
          type="text"
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          style={{ flexGrow: 1 }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              search();
            }
          }}
          disabled={searchStatus === "pending"}
          placeholder="Search or enter a URL"
        />
        {isUrl_ ? (
          <button
            style={{ marginLeft: "0.5rem" }}
            onClick={alert}
            disabled={searchStatus === "pending"}
          >
            Add URL
          </button>
        ) : (
          <button
            style={{ marginLeft: "0.5rem" }}
            onClick={search}
            disabled={searchStatus === "pending"}
          >
            Search
          </button>
        )}
      </div>
      {searchResults ? (
        <>
          <p>
            <b>Results</b>
          </p>
          <button
            onClick={() => {
              setSearchResults(undefined);
              setSearchQuery("");
            }}
            className="link"
            style={{ marginBottom: "1rem" }}
          >
            Back to list
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            {searchResults?.pages.map((result) => (
              <Source source={result} key={result.url} />
            ))}
          </div>
        </>
      ) : (
        <>
          <p>
            <b>Sources</b>
          </p>
          {pages.length > 0 ? (
            pages.map((page) => <Source source={page} key={page.url} />)
          ) : (
            <p>No sources yet</p>
          )}
        </>
      )}
    </>
  );
}
