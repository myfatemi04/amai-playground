import { createContext, SetStateAction } from "react";
import { Page } from "../api";
import { ChatEventType } from "./ChatPanel";

const ResearchWritingContext = createContext({
  pages: [] as Page[],
  setPages: (pages: SetStateAction<Page[]>) => {},
  readingUrl: null as string | null,
  setReadingUrl: (url: string | null) => {},
  chat: [] as ChatEventType[],
  setChat: (chat: SetStateAction<ChatEventType[]>) => {},
});

export default ResearchWritingContext;
