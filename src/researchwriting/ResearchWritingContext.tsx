import { createContext, SetStateAction } from "react";

type DropHistory = {
  url: string;
  title: string;
};

const ResearchWritingContext = createContext({
  draggedUrl: null as string | null,
  setDraggedUrl: (draggedUrl: string | null) => {},
  dropHistory: [] as DropHistory[],
  setDropHistory: (dropHistory: SetStateAction<DropHistory[]>) => {},
});

export default ResearchWritingContext;
