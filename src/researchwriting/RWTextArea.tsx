import { useRef, useState } from "react";
import useCursor from "./useCursor";
import useSuggestion from "./useSuggestion";

export default function RWTextArea() {
  const [content, setContent] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const cursor = useCursor(ref.current);
  const { suggestion, status } = useSuggestion(content.slice(0, cursor));

  return (
    <div>
      <textarea
        ref={ref}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
