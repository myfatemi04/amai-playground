import { createContext, ReactNode, useCallback, useState } from "react";
import { getPage } from "../api";

type ParsedPageInformation = {
  url: string;
  title: string;
  content: string;
};

export const PageContentCacheContext = createContext({
  urls: {} as Record<string, ParsedPageInformation | null>,
  async request(url: string): Promise<ParsedPageInformation | null> {
    throw new Error("Not implemented");
  },
});

export default function PageContentCacheProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [urls, setUrls] = useState(
    {} as Record<string, ParsedPageInformation | null>
  );
  const request = useCallback(
    async (url: string) => {
      let content: ParsedPageInformation | null = urls[url];
      if (urls[url] === undefined) {
        const result = await getPage(url);
        if (!result) {
          content = null;
        } else {
          content = { url, ...result };
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
