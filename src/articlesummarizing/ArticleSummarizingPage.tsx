import { useCallback, useState } from "react";
import Button from "../Button";
import Header from "../Header";
import { getMainArticleContentFromURL, htmlToMarkdown } from "../html2markdown";
import ArticleSummarizer from "./ArticleSummarizer";

export default function ArticleSummarizingPage() {
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState<string | null>(null);

  const loadContentForPage = useCallback(() => {
    getMainArticleContentFromURL(url).then((content) =>
      setMarkdown(content ? htmlToMarkdown(content) : null)
    );
  }, [url]);

  return (
    <div
      style={{
        backgroundColor: "#111111",
        color: "white",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header>Internet Question Answering</Header>
      <p>Choose page</p>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          onChange={(e) => setUrl(e.target.value)}
          value={url}
          style={{ flexGrow: 1 }}
        />
        <Button
          background="transparent"
          foreground="white"
          margin="0 0 0 1rem"
          onClick={loadContentForPage}
        >
          Load
        </Button>
      </div>
      <ArticleSummarizer markdown={markdown ?? "(null)"} />
    </div>
  );
}
