import { useContext, useEffect, useMemo } from "react";
import chunkText from "./chunkText";
import { EmbeddingsCacheContext } from "./researchwriting/EmbeddingsCache";

export function chunkify(markdown: string) {
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

  return chunkText(filteredParagraphs.join("\n\n"), 2048, 4096);
}

export function useEmbeddings(chunks: string[]) {
  const { embeddingsResults, requestEmbedding } = useContext(
    EmbeddingsCacheContext
  );

  useEffect(() => {
    for (let chunk of chunks) {
      if (!embeddingsResults[chunk]) {
        requestEmbedding(chunk);
      }
    }
  }, [chunks, embeddingsResults, requestEmbedding]);

  const embeddings = useMemo(() => {
    const embeddings = [];
    for (let chunk of chunks) {
      const embedding = embeddingsResults[chunk];
      if (embedding) {
        embeddings.push(embedding);
      } else {
        return null;
      }
    }
    return embeddings;
  }, [chunks, embeddingsResults]);

  return embeddings;
}
