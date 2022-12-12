import { useEffect, useRef, useState } from "react";
import { api } from "../api";

const SUGGESTION_TIMEOUT_MS = 2000;

export default function useSuggestion(text: string) {
  const timerRef = useRef<NodeJS.Timeout>();
  const [suggestion, setSuggestion] = useState<{
    text: string;
    completion: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  useEffect(() => {
		setSuggestion(null);
    if (text.length === 0) {
      return;
    }
    setStatus("pending");
    timerRef.current = setTimeout(async () => {
      try {
        const { completion } = await api("generate_completion", {
          prompt: text,
        });
        setSuggestion((suggestion) =>
          suggestion === null ? { text, completion } : suggestion
        );
        setStatus("idle");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    }, SUGGESTION_TIMEOUT_MS);
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [text]);

  return { suggestion: suggestion?.completion ?? null, status };
}
