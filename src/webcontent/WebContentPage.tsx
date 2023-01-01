import { useCallback, useState } from "react";
import { getPage } from "../api";
import Button from "../Button";
import Header from "../Header";
import LongformPromptAnswering from "../LongformPromptAnswering";

export default function WebContentPage() {
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState<{
    content: string;
    title: string;
  } | null>(null);
  const [articlePrefixText, setArticlePrefixText] =
    useState("No article loaded");

  const loadContentForPage = useCallback(async () => {
    try {
      setArticlePrefixText("Loading...");
      setArticle(await getPage(url));
      setArticlePrefixText("Loaded!");
    } catch (e) {
      console.error(e);
      setArticlePrefixText("Error");
    }
  }, [url]);

  return (
    <div
      className="black"
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <Header>Research AI</Header>
      <p>
        This is a tool to help answer questions about research papers. It
        supports PDFs (which means ArXiV) and HTML pages. For HTML, it attempts
        to parse a Markdown version of the page content.
      </p>
      <p>How does it work?</p>
      <ol style={{ marginTop: "0.25rem" }}>
        <li>You type in a URL for a page and click the "Load" button</li>
        <li>
          I load the text content of the page (or PDF) and show you a preview
        </li>
        <li>
          You type in a question or an instruction and click the "Compute"
          button
        </li>
        <li>
          I break the text into chunks and rank them according to their
          relevance to the instruction
        </li>
        <li>
          I compute the result independently for each chunk and compile them
          into a final answer
        </li>
      </ol>
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
      <p>{articlePrefixText}</p>
      {article && (
        <LongformPromptAnswering
          markdown={article.content ?? "(null)"}
          title={article.title}
        />
      )}
    </div>
  );
}
