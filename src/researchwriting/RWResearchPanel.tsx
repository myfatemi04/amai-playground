import { useEffect, useState } from "react";
import { api } from "../api";

export interface SearchResultPage {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResults {
  pages: SearchResultPage[];
  related_searches: string[];
  query: string;
}

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
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>();
  const [status, setStatus] = useState<"idle" | "pending" | "errored">("idle");

  useEffect(() => {
    if (!searchText.trim()) {
      return;
    }
    const timeout = setTimeout(async () => {
      setStatus("pending");
      try {
        const results = await getSearchResults(searchText);
        setSearchResults(results);
        setStatus("idle");
      } catch (e) {
        console.error(e);
        setStatus("errored");
      }
    }, SEARCH_TIMEOUT_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchText]);

  return (
    <>
      <h3 style={{ margin: "0.5rem 0" }}>Research Panel</h3>
      <input
        type="text"
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
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
        {searchResults?.pages.map((result) => (
          <div
            key={result.url}
            style={{ cursor: "pointer" }}
            onDragStart={() => setDraggedUrl(result.url)}
            onDragEnd={(e) => e.preventDefault()}
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
