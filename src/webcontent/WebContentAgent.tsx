import { useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "../api";
import Button from "../Button";
import chunkText from "../chunkText";
import rateDocumentsForQuery from "../rateDocumentsForQuery";

async function createAggregateResponse(question: string, subanswers: string[]) {
  const { completion } = await api("generate_for_prompt", {
    prompt_id: "63ae608b29223dec63ce9621",
    variables: {
      question,
      subanswers: subanswers.map((ans) => ans.trim()).join("\n\n"),
    },
  });
  return completion;
}

export default function ArticleSummarizer({
  markdown,
  title,
}: {
  markdown: string;
  title: string;
}) {
  const [instruction, setInstruction] = useState("");
  const [aggregateResponse, setAggregateResponse] = useState<string | null>(
    null
  );
  const [status, setStatus] = useState("Ready");

  const markdownChunks = useMemo(() => chunkText(markdown, 4096), [markdown]);

  const generateCompletions = useCallback(async () => {
    const chunkCount = 3;
    let topDocumentIndices: number[];
    if (markdownChunks.length <= chunkCount) {
      setStatus(
        "Breaking document into chunks and ranking them for relevance..."
      );

      const { documentSimilarityScores } = await rateDocumentsForQuery(
        markdownChunks,
        instruction
      );
      // Take the top 5 documents
      topDocumentIndices = documentSimilarityScores
        .map((_, i) => i)
        .sort(
          (a, b) => documentSimilarityScores[b] - documentSimilarityScores[a]
        )
        .slice(0, chunkCount);

      console.log("Debug:", { topDocumentIndices });
    } else {
      // Take the top 5 documents
      topDocumentIndices = [];
      for (let i = 0; i < chunkCount; i++) {
        topDocumentIndices.push(i);
      }
    }

    // Select the top 5 documents
    const topDocumentChunks = topDocumentIndices.map((i) => markdownChunks[i]);

    setStatus("Generating completions for each document section...");

    const promises = await Promise.allSettled(
      topDocumentChunks.map((markdown) =>
        api("generate_for_prompt", {
          prompt_id: "639695953ee71dbb54be8165",
          variables: {
            title: title,
            content: markdown,
            context: instruction,
          },
        })
      )
    );
    const completions = [];
    for (const promise of promises) {
      if (promise.status === "rejected") {
        console.warn("Failed to generate completions", promise.reason);
        completions.push(null);
      } else {
        completions.push(promise.value.completion);
      }
    }

    setStatus("Compiling completions into a single response...");

    const aggregateResponse = await createAggregateResponse(
      instruction,
      completions
    );
    setAggregateResponse(aggregateResponse);

    setStatus("Ready");
  }, [instruction, markdownChunks, title]);

  return (
    <div>
      <p>Prompt</p>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          onChange={(e) => setInstruction(e.target.value)}
          value={instruction}
          style={{ flexGrow: 1 }}
        />
        <Button
          background="transparent"
          foreground="white"
          margin="0 0 0 1rem"
          onClick={generateCompletions}
        >
          Compute
        </Button>
      </div>
      <p>{status}</p>
      {aggregateResponse !== null && (
        <>
          <p>Answer</p>
          <pre>{aggregateResponse.trim()}</pre>
          {/* {completions.map((completion, idx) => (
            <pre key={idx}>{completion.trim()}</pre>
          ))} */}
        </>
      )}
      <h1>{title}</h1>
      <ReactMarkdown children={markdown} />
    </div>
  );
}
