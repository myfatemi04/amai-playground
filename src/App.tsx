import { useCallback, useEffect, useRef, useState } from "react";

async function generate(prompt: string) {
  // const token = await getToken();
  const token = "$demo";
  if (token == null) {
    return "<No access token provided>" + JSON.stringify(token);
  }
  const req = await fetch(
    "https://7azz4l2unk.execute-api.us-east-1.amazonaws.com/generate_completion",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, token }),
    }
  );
  const result = await req.json();
  return result.completion as string;
}

async function logInstructionSubmission(instruction: string) {}

async function logCompletionCopy(instruction: string, completion: string) {}

async function logCompletionFeedback(
  instruction: string,
  completion: string,
  feedback: string
) {}

function App() {
  const [lastSubmittedInstruction, setLastSubmittedInstruction] = useState("");
  const [instruction, setInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [completions, setCompletions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [sentFeedback, setSentFeedback] = useState(false);
  const feedbackRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(() => {
    setGenerating(true);
    logInstructionSubmission(instruction);
    generate(instruction)
      .then((completion) => {
        setCompletionIndex(0);
        setCompletions([completion]);
        setLastSubmittedInstruction(instruction);
      })
      .finally(() => setGenerating(false));
  }, [instruction]);

  const previous = useCallback(() => {
    setCompletionIndex(
      (i) => (i + completions.length - 1) % completions.length
    );
  }, [completions.length]);

  const next = useCallback(() => {
    if (completionIndex < completions.length - 1) {
      setCompletionIndex(completionIndex + 1);
    } else {
      setGenerating(true);
      generate(instruction)
        .then((completion) => {
          setCompletionIndex(completions.length);
          setCompletions([...completions, completion]);
        })
        .finally(() => setGenerating(false));
    }
  }, [completionIndex, completions, instruction]);

  const generateMore = useCallback(() => {
    setGenerating(true);
    generate(instruction + completions[completionIndex])
      .then((completion) => {
        setCompletions([
          ...completions.slice(0, completionIndex),
          completions[completionIndex] + completion,
          ...completions.slice(completionIndex + 1),
        ]);
      })
      .finally(() => setGenerating(false));
  }, [completionIndex, completions, instruction]);

  useEffect(() => {
    setCopied(false);
    setSentFeedback(false);
  }, [completions, completionIndex]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(completions[completionIndex]);
    setCopied(true);
    logCompletionCopy(lastSubmittedInstruction, completions[completionIndex]);
  }, [completionIndex, completions, lastSubmittedInstruction]);

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
      <h1>AugmateAI Playground</h1>
      <span>Give an instruction</span>
      <input
        type="text"
        style={{ marginTop: "0.5rem" }}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            submit();
          }
        }}
        onChange={(e) => setInstruction(e.target.value)}
      />
      <div style={{ display: "flex", marginTop: "0.5rem" }}>
        {completions.length === 0 ? (
          <button onClick={submit} disabled={generating}>
            Submit
          </button>
        ) : (
          <>
            <button
              onClick={previous}
              disabled={completionIndex === 0 || generating}
            >
              Previous suggestion
            </button>
            <button
              style={{ marginLeft: "0.5rem" }}
              onClick={next}
              disabled={generating}
            >
              Next suggestion
            </button>
          </>
        )}
      </div>
      {completions.length > 0 && (
        <div
          style={{
            borderTop: "1px solid grey",
            paddingTop: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          {/* Require user to click the "copy" button for the best choice, so we know which ones they thought were valuable */}
          <div style={{ display: "flex" }}>
            <button onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
            <input
              type="text"
              ref={feedbackRef}
              style={{ marginLeft: "0.5rem", width: "15rem" }}
            />
            <button
              style={{ marginLeft: "0.5rem" }}
              onClick={() => {
                if (sentFeedback) {
                  return;
                }
                if (!feedbackRef.current) {
                  return;
                }
                if (feedbackRef.current.value.length === 0) {
                  return;
                }
                logCompletionFeedback(
                  lastSubmittedInstruction,
                  completions[completionIndex],
                  feedbackRef.current.value
                ).then(() => setSentFeedback(true));
              }}
            >
              {!sentFeedback ? "Send feedback" : "Thanks!"}
            </button>
            <button
              style={{ marginLeft: "0.5rem" }}
              onClick={generateMore}
              disabled={generating}
            >
              Generate more
            </button>
          </div>
          <pre
            style={{
              userSelect: "none",
              whiteSpace: "pre-line",
            }}
          >
            {completions[completionIndex].trim()}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
