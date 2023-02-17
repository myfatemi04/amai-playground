import { createContext, SetStateAction } from "react";

export type SelectionRange = {
  start: number;
  end: number;
};

export type Suggestion = {
  startIndex: number;
  endIndex: number;
  content: string;
};

const ResearchWritingContext = createContext({
  textboxGenerationStatus: "idle" as "idle" | "pending" | "error",
  setTextboxGenerationStatus: (status: "idle" | "pending" | "error") => {},
  content: "" as string,
  setContent: (content: SetStateAction<string>) => {},
  selection: null! as SelectionRange,
  setSelection: (selection: SetStateAction<SelectionRange>) => {},
  inRevisingMode: false,
  setInRevisingMode: (inRevisingMode: boolean) => {},
  suggestions: [] as Suggestion[],
  setSuggestions: (suggestions: SetStateAction<Suggestion[]>) => {},
});

export default ResearchWritingContext;
