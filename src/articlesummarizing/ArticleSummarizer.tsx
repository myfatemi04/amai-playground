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
      subanswers: subanswers.map(ans => ans.trim()).join("\n\n"),
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
  const [completions, setCompletions] = useState<string[] | null>(null);
  const [aggregateResponse, setAggregateResponse] = useState<string | null>(
    null
  );

  const markdownChunks = useMemo(() => chunkText(markdown, 4096), [markdown]);

  const generateCompletions = useCallback(async () => {
    const { documentSimilarityScores } = await rateDocumentsForQuery(
      markdownChunks,
      instruction
    );
    // Take the top 5 documents
    const topDocumentIndices = documentSimilarityScores
      .map((_, i) => i)
      .sort((a, b) => documentSimilarityScores[b] - documentSimilarityScores[a])
      .slice(0, 5);

    console.log(topDocumentIndices);

    // Select the top 5 documents
    const topDocumentChunks = topDocumentIndices.map((i) => markdownChunks[i]);

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
    setCompletions(completions);
    const aggregateResponse = await createAggregateResponse(
      instruction,
      completions
    );
    setAggregateResponse(aggregateResponse);
  }, [instruction, markdownChunks, title]);

  return (
    <div>
      <p>Question</p>
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
          Answer
        </Button>
      </div>
      {completions !== null ? (
        <>
          <p>Answer</p>
          <pre>{aggregateResponse}</pre>
          {/* {completions.map((completion, idx) => (
            <pre key={idx}>{completion.trim()}</pre>
          ))} */}
        </>
      ) : (
        <p>No answer yet</p>
      )}
      <h1>{title}</h1>
      <ReactMarkdown children={markdown} />
    </div>
  );
}
