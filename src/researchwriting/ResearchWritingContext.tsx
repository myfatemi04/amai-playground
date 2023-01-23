import { createContext, SetStateAction } from "react";
import { Page } from "../api";
import { ChatEventType } from "./ChatPanel";

export type SelectionRange = {
  start: number;
  end: number;
};

const ResearchWritingContext = createContext({
  pages: [] as Page[],
  setPages: (pages: SetStateAction<Page[]>) => {},
  readingUrl: null as string | null,
  setReadingUrl: (url: string | null) => {},
  chat: [] as ChatEventType[],
  setChat: (chat: SetStateAction<ChatEventType[]>) => {},
  textboxGenerationStatus: "idle" as "idle" | "pending" | "error",
  setTextboxGenerationStatus: (status: "idle" | "pending" | "error") => {},
  content: "" as string,
  setContent: (content: SetStateAction<string>) => {},
  selection: null! as SelectionRange,
  setSelection: (selection: SetStateAction<SelectionRange>) => {},
  inRevisingMode: false,
  setInRevisingMode: (inRevisingMode: boolean) => {},
});

export default ResearchWritingContext;
