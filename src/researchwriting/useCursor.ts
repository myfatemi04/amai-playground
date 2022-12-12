import { useEffect, useState } from "react";

export default function useCursor(textbox: HTMLTextAreaElement | null) {
  const [cursor, setCursor] = useState<number>(0);

  useEffect(() => {
    if (!textbox) {
      return;
    }
    const updateCursor = () => {
      setCursor(textbox.selectionEnd);
    };
    textbox.addEventListener("keydown", updateCursor);
    textbox.addEventListener("mousedown", updateCursor);
    textbox.addEventListener("mouseup", updateCursor);
    textbox.addEventListener("focus", updateCursor);
    return () => {
      textbox.removeEventListener("keydown", updateCursor);
      textbox.removeEventListener("mousedown", updateCursor);
      textbox.removeEventListener("mouseup", updateCursor);
      textbox.removeEventListener("focus", updateCursor);
    };
  }, [textbox]);

  return cursor;
}
