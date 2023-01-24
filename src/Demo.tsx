import { useCallback, useState } from "react";
import { api } from "./api";
import DefaultLayout from "./DefaultLayout";

const demoInputText =
  `The dominant sequence transduction models are based on complex recurrent or
convolutional neural networks that include an encoder and a decoder. The best
performing models also connect the encoder and decoder through an attention
mechanism. We propose a new simple network architecture, the Transformer,
based solely on attention mechanisms, dispensing with recurrence and convolutions
entirely. Experiments on two machine translation tasks show these models to
be superior in quality while being more parallelizable and requiring significantly
less time to train. Our model achieves 28.4 BLEU on the WMT 2014 Englishto-German translation task, improving over the existing best results, including
ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task,
our model establishes a new single-model state-of-the-art BLEU score of 41.8 after
training for 3.5 days on eight GPUs, a small fraction of the training costs of the
best models from the literature. We show that the Transformer generalizes well to
other tasks by applying it successfully to English constituency parsing both with
large and limited training data.`.replace(/\n/g, " ");

export function Demo() {
  const [instructions, setInstructions] = useState("");
  const revisionsPromptId = "63d039654144a4c0420c0f95";
  const [status, setStatus] = useState<"pending" | "idle" | "error">("idle");
  const [result, setResult] = useState("");

  const submit = useCallback(async () => {
    setStatus("pending");
    try {
      const { completion: result } = await api("generate_for_prompt", {
        prompt_id: revisionsPromptId,
        variables: {
          instructions,
          context: demoInputText,
        },
      });
      setResult(result);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
    }
  }, [instructions]);

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Try it yourself</h1>
      <p className="label-header">Input text</p>
      <pre>{demoInputText}</pre>

      <p className="label-header">Instructions</p>
      <input
        type="text"
        onChange={(e) => setInstructions(e.target.value)}
        value={instructions}
        style={{ width: "100%" }}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        disabled={status === "pending"}
      />

      {status === "pending" ? (
        <p className="label-header">AI is working</p>
      ) : status === "error" ? (
        <p className="label-header">AI failed to generate a result</p>
      ) : null}
      {result && (
        <>
          <p className="label-header">Result</p>
          <pre>{result}</pre>
        </>
      )}
    </>
  );
}

export default function DemoPage() {
  return (
    <DefaultLayout white>
      <div style={{ maxWidth: "40rem", margin: "0 auto 0" }}>
        <Demo />
      </div>
    </DefaultLayout>
  );
}
