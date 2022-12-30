import { useCallback, useMemo, useState } from "react";
import { api } from "../api";
import Button from "../Button";
import Header from "../Header";
import { getMainArticle, htmlToMarkdown } from "../html2markdown";
import ArticleSummarizer from "./WebContentAgent";

async function getPage(url: string) {
  const { result } = await api("retrieval_enhancement", {
    backend: "proxy",
    query: url,
  });
  return result as { content: string; type: "html" | "" };
}

export default function WebContentPage() {
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState<{
    content: string;
    title: string;
  } | null>(null);

  const loadContentForPage = useCallback(() => {
    getPage(url).then(({ content, type }) => {
      if (type === "html") {
        setArticle(getMainArticle(content));
      } else {
        setArticle({
          content,
          title: "[PDF]",
        });
      }
    });
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
        height: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <Header>Internet ChatGPT</Header>
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
