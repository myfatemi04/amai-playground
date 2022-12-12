import { useContext, useEffect, useRef, useState } from "react";
import { api } from "../api";
import { EventLoggingContext } from "./EventLogging";

const SUGGESTION_TIMEOUT_MS = 2000;

export default function useSuggestion(text: string) {
  const timerRef = useRef<NodeJS.Timeout>();
  const [suggestion, setSuggestion] = useState<{
    text: string;
    completion: string | null;
  }>({ text, completion: null });
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const { logError } = useContext(EventLoggingContext);

  useEffect(() => {
    setSuggestion({ text, completion: null });
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
          suggestion.text === text ? { text, completion } : suggestion
        );
        setStatus("idle");
      } catch (error) {
        logError(error);
        setStatus("error");
      }
    }, SUGGESTION_TIMEOUT_MS);
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [logError, text]);

  return { suggestion: suggestion?.completion ?? null, status };
}
