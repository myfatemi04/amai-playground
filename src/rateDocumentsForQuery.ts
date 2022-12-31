import { api, createEmbedding } from "./api";

function dotProduct(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function rateDocumentEmbeddingsForQueryEmbedding(
  queryEmbedding: number[],
  documentEmbeddings: number[][]
) {
  return documentEmbeddings.map((chunkEmbedding) =>
    dotProduct(queryEmbedding, chunkEmbedding)
  );
}

export default async function rateDocumentsForQuery(
  documents: string[],
  query: string
) {
  // create vectors
  const queryEmbedding = await createEmbedding(query);
  const documentEmbeddings = await Promise.allSettled(
    documents.map((chunk) => api("generate_embedding", { prompt: chunk }))
  ).then((results) =>
    results.map((result) =>
      result.status === "fulfilled" ? result.value.embedding : null
    )
  );
  const documentSimilarityScores = documentEmbeddings.map((chunkEmbedding) =>
    dotProduct(queryEmbedding, chunkEmbedding)
  );

  return {
    queryEmbedding,
    documentEmbeddings,
    documentSimilarityScores,
  };
}
