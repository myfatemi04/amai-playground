import { useEffect, useState } from "react";
import { SelectionRange } from "./ResearchWritingContext";

export default function useSelectionRange(textbox: HTMLTextAreaElement | null) {
  const [selection, setSelection] = useState<SelectionRange>({
    start: 0,
    end: 0,
  });

  useEffect(() => {
    if (!textbox) {
      return;
    }
    const updateCursor = () => {
      setSelection({
        start: textbox.selectionStart,
        end: textbox.selectionEnd,
      });
    };
    textbox.addEventListener("keydown", updateCursor);
    textbox.addEventListener("keyup", updateCursor);
    textbox.addEventListener("mousedown", updateCursor);
    textbox.addEventListener("mouseup", updateCursor);
    textbox.addEventListener("focus", updateCursor);
    return () => {
      textbox.removeEventListener("keydown", updateCursor);
      textbox.removeEventListener("keyup", updateCursor);
      textbox.removeEventListener("mousedown", updateCursor);
      textbox.removeEventListener("mouseup", updateCursor);
      textbox.removeEventListener("focus", updateCursor);
    };
  }, [textbox]);

  return selection;
}
