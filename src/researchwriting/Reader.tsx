import { useContext, useMemo } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { htmlToMarkdown } from "../html2markdown";
import { chunkify } from "../long";
import { PageContentCacheContext } from "./PageContentCache";

function ReaderInner({ page }: any) {
  const markdown = useMemo(() => {
    return htmlToMarkdown(page.content, {
      ignoreImages: true,
      ignoreLinks: true,
    });
  }, [page]);

  const chunks = useMemo(() => {
    return chunkify(markdown);
  }, [markdown]);

  return (
    <>
      <h3>{page.title}</h3>
      <p>
        <a href={page.url} target="_blank" rel="noreferrer">
          {page.url}
        </a>
      </p>
      <div style={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <h3>Summary</h3>
          {chunks.map((chunk: any, i: number) => (
            <div key={i}>
              <pre style={{ whiteSpace: "pre-wrap" }}>{chunk}</pre>
            </div>
          ))}
        </div>
        <div
          style={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
            overflowY: "auto",
          }}
        >
          <ReactMarkdown children={markdown!} />
        </div>
      </div>
    </>
  );
}

export default function Reader({ url }: { url: string }) {
  const { request, urls } = useContext(PageContentCacheContext);

  const page = urls[url]!;

  if (urls[url] === undefined) {
    request(url);
    return (
      <>
        <h1>Loading...</h1>
      </>
    );
  }

  if (urls[url] === null) {
    return (
      <>
        <h1>Failed to load page</h1>
      </>
    );
  }

  return <ReaderInner page={page} />;
}
