import { createContext, ReactNode, useCallback, useState } from "react";
import { createEmbedding } from "../api";

export type EmbeddingsResult =
  | {
      embedding: number[];
      pending: false;
    }
  | {
      embedding: null;
      pending: true;
    };

export const EmbeddingsCacheContext = createContext({
  requestEmbedding: async (text: string): Promise<void> => {
    throw new Error("Not implemented");
  },
  embeddingsResults: {} as Record<string, EmbeddingsResult>,
});

export default function EmbeddingsCache({ children }: { children: ReactNode }) {
  const [embeddingsResults, setEmbeddingsResults] = useState<
    Record<string, EmbeddingsResult>
  >({});

  const requestEmbedding = useCallback(
    async (text: string) => {
      if (embeddingsResults[text] == null) {
        const embedding = await createEmbedding(text);
        setEmbeddingsResults((prev) => ({
          ...prev,
          [text]: {
            embedding,
            pending: false,
          } as EmbeddingsResult,
        }));
      }
    },
    [embeddingsResults]
  );

  return (
    <EmbeddingsCacheContext.Provider
      value={{ embeddingsResults, requestEmbedding }}
      children={children}
    />
  );
}
