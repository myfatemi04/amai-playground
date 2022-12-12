import { Readability } from "@mozilla/readability";
import { createContext, ReactNode, useCallback, useState } from "react";
import { api } from "../api";

async function getPageHtml(url: string) {
  const { result } = await api("retrieval_enhancement", {
    backend: "proxy",
    query: url,
  });
  return result as string;
}

function htmlToText(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const reader = new Readability(document);
  const article = reader.parse();
  return article;
}

type ParsedPageInformation = ReturnType<typeof htmlToText>;

export const PageContentCacheContext = createContext({
  urls: {} as Record<string, ParsedPageInformation>,
  async request(url: string): Promise<ReturnType<typeof htmlToText>> {
    throw new Error("Not implemented");
  },
});

export default function PageContentCacheProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [urls, setUrls] = useState({} as Record<string, ParsedPageInformation>);
  const request = useCallback(
    async (url: string) => {
      let content: ParsedPageInformation = urls[url];
      if (urls[url] === undefined) {
        try {
          content = htmlToText(await getPageHtml(url));
        } catch (e) {
          content = null;
        }
        setUrls((urls) => ({ ...urls, [url]: content }));
      }
      return content;
    },
    [urls]
  );
  return (
    <PageContentCacheContext.Provider value={{ urls, request }}>
      {children}
    </PageContentCacheContext.Provider>
  );
}
