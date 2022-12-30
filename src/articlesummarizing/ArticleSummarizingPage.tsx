import { useCallback, useMemo, useState } from "react";
import Button from "../Button";
import Header from "../Header";
import { getMainArticleFromURL, htmlToMarkdown } from "../html2markdown";
import ArticleSummarizer from "./ArticleSummarizer";

export default function ArticleSummarizingPage() {
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState<{
    content: string;
    title: string;
  } | null>(null);

  const loadContentForPage = useCallback(() => {
    getMainArticleFromURL(url).then(setArticle);
  }, [url]);

  const markdown = useMemo(() => {
    if (!article) {
      return null;
    }

    return htmlToMarkdown(article.content, {
      ignoreImages: true,
      ignoreLinks: true,
    });
  }, [article]);

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
      {article && (
        <ArticleSummarizer
          markdown={markdown ?? "(null)"}
          title={article.title}
        />
      )}
    </div>
  );
}
