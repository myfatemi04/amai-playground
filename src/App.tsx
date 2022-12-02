import { useCallback, useEffect, useRef, useState } from "react";

async function getToken() {
  return "$playground";
}

async function api(path: string, body: any) {
  const result = await fetch(
    `https://7azz4l2unk.execute-api.us-east-1.amazonaws.com/${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        token: await getToken(),
      }),
    }
  );
  return await result.json();
}

async function generate(prompt: string, context = "") {
  // const result = await api("generate_completion", {
  //   prompt: `Instruction: ${prompt}\n\nResult:\n${context}`,
  // });
  const result = await api("generate_completion", {
    prompt: `${prompt}\n${context}`,
  });
  return (result.completion ?? "[error]") as string;
}

// Returns ID of the inserted interaction
async function logInstructionSubmission(prompt: string) {
  const result = await api("log_interactions", {
    type: "create_interaction",
    prompt,
  });
  return result.interaction_id as string;
}

async function logCompletionCopy(interactionId: string, completion: string) {
  return await api("log_interactions", {
    type: "log_copy",
    interaction_id: interactionId,
    completion,
  });
}

async function logCompletionContinuation(
  interactionId: string,
  completion: string
) {
  return await api("log_interactions", {
    type: "log_continuation",
    interaction_id: interactionId,
    completion,
  });
}

async function logCompletionFeedback(
  interactionId: string,
  completion: string,
  feedback: string
) {
  return await api("log_interactions", {
    type: "log_feedback",
    interaction_id: interactionId,
    completion,
    feedback,
  });
}

function App() {
  const [interactionId, setInteractionId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [generating, setGenerating] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [completions, setCompletions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [sentFeedback, setSentFeedback] = useState(false);
  const feedbackRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(async () => {
    setGenerating(true);
    const interactionId = await logInstructionSubmission(instruction);
    setInteractionId(interactionId);
    generate(instruction)
      .then((completion) => {
        setCompletionIndex(0);
        setCompletions([completion]);
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

  const generateMore = useCallback(async () => {
    setGenerating(true);
    await logCompletionContinuation(
      interactionId,
      completions[completionIndex]
    );
    generate(instruction, completions[completionIndex])
      .then((completion) => {
        setCompletions([
          ...completions.slice(0, completionIndex),
          completions[completionIndex] + completion,
          ...completions.slice(completionIndex + 1),
        ]);
      })
      .finally(() => setGenerating(false));
  }, [completionIndex, completions, instruction, interactionId]);

  useEffect(() => {
    setCopied(false);
    setSentFeedback(false);
  }, [completions, completionIndex]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(completions[completionIndex]);
    setCopied(true);
    logCompletionCopy(interactionId, completions[completionIndex]);
  }, [completionIndex, completions, interactionId]);

  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        width: "calc(min(100vw, max(60vw, 40rem)))",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <img
          src="logo192.png"
          alt="AugmateAI Logo"
          style={{ width: "3rem", height: "3rem" }}
        />
        <span
          style={{
            display: "inline-block",
            fontSize: "3rem",
            fontWeight: "bold",
            marginTop: 0,
            marginBottom: 0,
            marginLeft: "0.5rem",
          }}
        >
          AugmateAI Playground
        </span>
      </div>
      <span>
        Powered by large language models. See the homepage:{" "}
        <a href="https://augmateai.michaelfatemi.com/">AugmateAI</a>
      </span>
      <span style={{ fontSize: "0.75rem" }}>
        The text you input here may be used to assess future use cases.
      </span>
      <input
        type="text"
        style={{ marginTop: "0.5rem" }}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            submit();
          }
        }}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Write an instruction..."
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
                  interactionId,
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
