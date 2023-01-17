import { createContext, SetStateAction } from "react";
import { Page } from "../api";

const ResearchWritingContext = createContext({
  pages: [] as Page[],
  setPages: (pages: SetStateAction<Page[]>) => {},
  readingUrl: null as string | null,
  setReadingUrl: (url: string | null) => {},
});

export default ResearchWritingContext;
