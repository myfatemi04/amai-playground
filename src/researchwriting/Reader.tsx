import { useContext, useMemo } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { htmlToMarkdown } from "../html2markdown";
import { PageContentCacheContext } from "./PageContentCache";

export default function Reader({ url }: { url: string }) {
  const { request, urls } = useContext(PageContentCacheContext);

  const page = urls[url]!;

  const markdown = useMemo(() => {
    if (page) {
      return htmlToMarkdown(page.content, {
        ignoreImages: true,
        ignoreLinks: true,
      });
    } else {
      return null;
    }
  }, [page]);

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

  return (
    <>
      <h3>{page.title}</h3>
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
      <ReactMarkdown children={markdown!} />
    </>
  );
}
