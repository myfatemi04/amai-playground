import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { api, createEmbedding } from "../api";
import Button from "../Button";
import chunkText from "../chunkText";
import { rateDocumentEmbeddingsForQueryEmbedding } from "../rateDocumentsForQuery";

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

const _dev_ = false;

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

  const chunks = useMemo(() => {
    const paragraphs = markdown.split("\n\n");
    const filteredParagraphs = [];
    for (let paragraph of paragraphs) {
      paragraph = paragraph.trim();
      if (paragraph.toLowerCase() === "references") {
        break;
      }
      if (paragraph.length > 10) {
        filteredParagraphs.push(paragraph);
      }
    }

    console.log({ filteredParagraphs });

    return chunkText(filteredParagraphs.join("\n\n"), 2048, 4096);
  }, [markdown]);
  const [chunkEmbeddings, setChunkEmbeddings] = useState<number[][] | null>(
    null
  );

  // For debugging / visualization
  const [chunkRankings, setChunkRankings] = useState<number[] | null>(null);
  const [completions, setCompletions] = useState<string[] | null>(null);

  useEffect(() => {
    setCompletions(null);
    setChunkRankings(null);
    setChunkEmbeddings(null);
  }, [markdown]);

  const generateCompletions = useCallback(async () => {
    const chunkCount = 3;

    let topDocumentIndices: number[];
    console.log("Number of markdownChunks:", chunks.length);
    if (chunks.length > chunkCount) {
      setStatus(
        "Breaking document into chunks and ranking them for relevance..."
      );

      let chunkEmbeddingsGuaranteed;

      if (chunkEmbeddings == null) {
        const promises = await Promise.allSettled(chunks.map(createEmbedding));
        const embeddings: number[][] = [];

        for (const promise of promises) {
          if (promise.status === "rejected") {
            console.warn("Failed to generate embeddings", promise.reason);
            setStatus("Failed to generate embeddings for document sections");
            return;
          } else {
            embeddings.push(promise.value);
          }
        }

        setChunkEmbeddings(embeddings);
        chunkEmbeddingsGuaranteed = embeddings;
      } else {
        chunkEmbeddingsGuaranteed = chunkEmbeddings;
      }

      const instructionEmbedding = await createEmbedding(instruction);

      const documentSimilarityScores = rateDocumentEmbeddingsForQueryEmbedding(
        instructionEmbedding,
        chunkEmbeddingsGuaranteed
      );

      const documentRankings = documentSimilarityScores
        .map((_, i) => i)
        .sort(
          (a, b) => documentSimilarityScores[b] - documentSimilarityScores[a]
        );
      // Take the top 5 documents
      topDocumentIndices = documentRankings.slice(0, chunkCount);

      setChunkRankings(documentRankings);

      console.log("Debug:", { topDocumentIndices });
    } else {
      // Take the top 5 documents
      topDocumentIndices = [];
      for (let i = 0; i < chunkCount; i++) {
        topDocumentIndices.push(i);
      }
    }

    // Select the top 5 documents
    const topDocumentChunks = topDocumentIndices.map((i) => chunks[i]);

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
    const completions: string[] = [];
    for (const promise of promises) {
      if (promise.status === "rejected") {
        console.warn("Failed to generate completions", promise.reason);
        setStatus("Failed to generate completions for document sections");
        setCompletions(null);
        setAggregateResponse(null);
        return;
      } else {
        completions.push(promise.value.completion);
      }
    }

    setCompletions(completions);

    setStatus("Compiling completions into a single response...");

    const aggregateResponse = await createAggregateResponse(
      instruction,
      completions
    );
    setAggregateResponse(aggregateResponse);

    setStatus("Ready");
  }, [chunks, instruction, chunkEmbeddings, title]);

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
        </>
      )}
      {_dev_ && (
        <>
          {chunks.map((chunk) => (
            <pre style={{ color: "gold" }}>{chunk}</pre>
          ))}
          {chunkRankings !== null && (
            <>
              <p>Chunk rankings</p>
              <pre>{JSON.stringify(chunkRankings, null, 2)}</pre>
            </>
          )}
        </>
      )}
      {completions !== null && chunkRankings !== null && (
        <>
          <p>Completions</p>
          {completions.map((completion, i) => (
            <>
              <p>
                Chunk {chunkRankings[i] + 1} / {chunkRankings.length}
              </p>
              <pre style={{ color: "green" }}>
                {chunks[chunkRankings[i]].trim()}
              </pre>
              <pre style={{ color: "red" }}>{completion.trim()}</pre>
            </>
          ))}
        </>
      )}
      <h1>{title}</h1>
      <ReactMarkdown children={markdown} />
    </div>
  );
}
