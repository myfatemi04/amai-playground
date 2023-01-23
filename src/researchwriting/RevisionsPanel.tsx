import { useCallback, useContext, useMemo, useState } from "react";
import { api } from "../api";
import { serializeChat } from "./ChatPanel";
import "./diff_match_patch";
import ResearchWritingContext from "./ResearchWritingContext";

const dmp = new diff_match_patch();

export default function RevisionsPanel() {
  const { content, setContent, selection, chat, setInRevisingMode } =
    useContext(ResearchWritingContext);
  const [instructions, setInstructions] = useState("");
  const selectedText = useMemo(
    () => content.slice(selection?.start, selection?.end),
    [content, selection?.end, selection?.start]
  );
  const [revision, setRevision] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");

  const [isDifferenceTab, setIsDifferenceTab] = useState(false);

  const difference = useMemo(() => {
    // Go sentence by sentence
    const result = dmp.diff_main(selectedText, revision);
    dmp.diff_cleanupSemantic(result);
    return result;
  }, [revision, selectedText]);

  const createRevision = useCallback(async () => {
    const promptId = "63cdfcefac70a6a9d0a5046f";

    setStatus("pending");

    try {
      const result = await api("generate_for_prompt", {
        prompt_id: promptId,
        variables: {
          text: selectedText,
          instructions,
          previous_context: serializeChat(chat),
        },
      });
      setStatus("idle");
      return result.completion.trim();
    } catch (e) {
      setStatus("error");
    }
  }, [chat, instructions, selectedText]);

  const acceptRevision = useCallback(() => {
    setInRevisingMode(false);
    setContent(
      (content) =>
        content.slice(0, selection?.start) +
        revision +
        content.slice(selection?.end)
    );
    setRevision("");
  }, [
    revision,
    selection?.end,
    selection?.start,
    setContent,
    setInRevisingMode,
  ]);

  return (
    <>
      <h3 style={{ margin: "0.5rem 0" }}>Revise text</h3>
      <p style={{ fontWeight: "bold", fontSize: "0.75rem", marginBottom: 0 }}>
        Original text
      </p>
      <pre style={{ fontFamily: "inherit" }}>
        {content.slice(selection?.start, selection?.end)}
      </pre>
      {status === "pending" ? (
        <p style={{ fontWeight: "bold", fontSize: "0.75rem" }}>
          AI is writing...
        </p>
      ) : status === "idle" ? (
        revision ? (
          <>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                marginBottom: 0,
              }}
            >
              {isDifferenceTab ? (
                <button
                  className="link"
                  onClick={() => setIsDifferenceTab(false)}
                >
                  Result
                </button>
              ) : (
                <span>Result</span>
              )}
              {!isDifferenceTab ? (
                <button
                  className="link"
                  style={{ marginLeft: "0.5rem" }}
                  onClick={() => setIsDifferenceTab(true)}
                >
                  Difference
                </button>
              ) : (
                <span style={{ marginLeft: "0.5rem" }}>Difference</span>
              )}
            </p>
            <pre style={{ fontFamily: "inherit" }}>
              {!isDifferenceTab
                ? revision
                : difference.map(([a, value]: any) => {
                    let color = a < 0 ? "red" : a > 0 ? "green" : "black";
                    return <span style={{ color }}>{value}</span>;
                  })}
            </pre>
          </>
        ) : null
      ) : (
        <>
          <p style={{ fontWeight: "bold", fontSize: "0.75rem" }}>
            AI failed to generate result
          </p>
        </>
      )}
      <p style={{ fontWeight: "bold", fontSize: "0.75rem" }}>Instructions</p>
      <textarea
        style={{ height: "5rem", fontFamily: "inherit", padding: "1rem" }}
        onChange={(e) => setInstructions(e.target.value)}
        value={instructions}
      />
      {!revision ? (
        <button
          style={{ marginTop: "0.5rem" }}
          onClick={() => {
            createRevision().then((result) => {
              setRevision(result);
            });
          }}
        >
          Submit
        </button>
      ) : (
        <>
          <div>
            <button
              style={{ marginTop: "0.5rem" }}
              onClick={() => {
                createRevision().then((result) => {
                  setRevision(result);
                });
              }}
            >
              Retry
            </button>
            <button
              style={{ marginTop: "0.5rem", marginLeft: "0.5rem" }}
              onClick={() => {
                setInRevisingMode(false);
              }}
            >
              Cancel
            </button>
            <button
              style={{ marginTop: "0.5rem", marginLeft: "0.5rem" }}
              onClick={acceptRevision}
            >
              Accept
            </button>
          </div>
        </>
      )}
    </>
  );
}
