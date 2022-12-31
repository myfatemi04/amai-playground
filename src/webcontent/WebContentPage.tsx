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
  return result as { content: string; type: "html" | "text-from-pdf" | "s3" };
}

export default function WebContentPage() {
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState<{
    content: string;
    title: string;
  } | null>(null);

  const loadContentForPage = useCallback(() => {
    getPage(url).then(async ({ content, type }) => {
      if (type === "s3") {
        const path = content;
        content = await fetch(
          "https://augmate-retrieval-content.s3.amazonaws.com/" + path
        ).then((r) => r.text());
        type = path.includes("html") ? "html" : "text-from-pdf";
      }
      if (type === "html") {
        setArticle(getMainArticle(content));
      } else if (type === "text-from-pdf") {
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
      <Header>Research AI</Header>
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
