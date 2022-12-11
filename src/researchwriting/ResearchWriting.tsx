import React, { CSSProperties, useCallback, useRef, useState } from "react";
import { api } from "../api";

interface Suggestion {
  text: string;
  position: number;
}

const SUGGESTION_DELAY_MS = 2000;

/*
Creates a word processor which is augmented with AI problem-solving tools.
*/
export default function ResearchWriting() {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const createSuggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [generationStatus, setGenerationStatus] = useState<
    null | "errored" | "pending"
  >(null);

  const createSuggestion = useCallback(async () => {
    if (!textareaRef.current) {
      return;
    }
    setGenerationStatus("pending");
    const textarea = textareaRef.current;
    const selection = {
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
    };
    const before = textarea.value.slice(0, selection.selectionEnd);
    // const after = textarea.value.slice(selection.selectionEnd);
    try {
      const result = await api("generate_completion", { prompt: before });
      if (result.completion) {
        setSuggestion({
          text: result.completion,
          position: selection.selectionEnd,
        });
        setGenerationStatus(null);
      }
    } catch (e) {
      console.error(e);
      setGenerationStatus("errored");
    }
  }, []);

  const onTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (createSuggestionTimeoutRef.current) {
        clearTimeout(createSuggestionTimeoutRef.current);
      }
      createSuggestionTimeoutRef.current = setTimeout(
        createSuggestion,
        SUGGESTION_DELAY_MS
      );
    },
    [createSuggestion]
  );

  const onTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!textareaRef.current) {
        return;
      }
      const textarea = textareaRef.current;
      if (e.code === "Enter" && e.ctrlKey) {
        createSuggestion();
      } else if ((e.code === "Tab" || e.code === "ArrowRight") && suggestion) {
        e.preventDefault();
        const before = textarea.value.slice(0, suggestion.position);
        const after = textarea.value.slice(suggestion.position);
        const text = before + suggestion.text + after;
        setContent(text);
        setSuggestion(null);
      } else {
        setSuggestion(null);
      }
    },
    [createSuggestion, suggestion]
  );

  const textareaStyle: CSSProperties = {
    fontFamily: "sans-serif",
    fontSize: "0.75rem",
    padding: "1rem",
    inset: 0,
    position: "absolute",
    border: "1px solid black",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        height: "100vh",
        width: "100vw",
        boxSizing: "border-box",
      }}
    >
      <h1>Research Writing Assistant</h1>
      <div style={{ display: "flex", height: "100%" }}>
        <div
          style={{
            flex: 5,
            display: "flex",
            flexDirection: "column",
            paddingRight: "2rem",
          }}
        >
          <h3>Writing Panel</h3>
          <span style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>
            {generationStatus &&
              {
                errored: "Error",
                pending: "Generating...",
              }[generationStatus]}
          </span>
          <div style={{ position: "relative", height: "100%" }}>
            <div
              style={{
                ...textareaStyle,
                borderColor: "transparent",
                zIndex: 1,
                pointerEvents: "none",
              }}
            >
              {suggestion && (
                <>
                  <pre
                    style={{
                      visibility: "hidden",
                      margin: 0,
                      fontFamily: textareaStyle.fontFamily,
                      display: "inline",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {content.slice(0, suggestion.position)}
                  </pre>
                  <pre
                    style={{
                      color: "grey",
                      fontStyle: "italic",
                      margin: 0,
                      fontFamily: textareaStyle.fontFamily,
                      display: "inline",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {suggestion.text}
                  </pre>
                </>
              )}
            </div>
            <textarea
              ref={textareaRef}
              onChange={onTextareaChange}
              onKeyDown={onTextareaKeyDown}
              value={content}
              rows={40}
              cols={80}
              style={textareaStyle}
            />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h3>Research Panel</h3>
        </div>
      </div>
    </div>
  );
}
