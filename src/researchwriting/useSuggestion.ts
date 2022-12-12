import { useEffect, useRef, useState } from "react";
import { api } from "../api";

export default function useSuggestion(text: string) {
  const timerRef = useRef<NodeJS.Timeout>();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  useEffect(() => {
    setStatus("pending");
    timerRef.current = setTimeout(async () => {
      try {
        const { completion } = await api("generate_completion", {
          prompt: text,
        });
        setSuggestion(completion);
        setStatus("idle");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    }, 1000);
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [text]);

  return { suggestion, status };
}
