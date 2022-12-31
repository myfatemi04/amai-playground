import { getMainArticle, htmlToMarkdown } from "./html2markdown";

export async function getToken(): Promise<string> {
  if (window.location.pathname === "/researchwriting") {
    return "$research-writing";
  } else {
    return "$playground";
  }
}

export async function createEmbedding(prompt: string): Promise<number[]> {
  return await api("generate_embedding", {
    prompt,
  }).then((r) => r.embedding);
}

export async function getSearchResults(query: string): Promise<SearchResults> {
  const {
    result: { content },
  } = await api("retrieval_enhancement", {
    backend: "bing",
    query,
  });
  return { ...content, query };
}

export type TranscriptItem = {
  start: number;
  duration: number;
  text: string;
};

export async function getYoutubeTranscript(
  query: string
): Promise<TranscriptItem[]> {
  const response = await api("retrieval_enhancement", {
    backend: "youtube",
    query,
  });
  return response.result.content;
}

async function getPageHelper(url: string) {
  const { result } = await api("retrieval_enhancement", {
    backend: "proxy",
    query: url,
  });
  return result as { content: string; type: "html" | "text-from-pdf" | "s3" };
}

export async function getPage(
  url: string
): Promise<{ content: string; title: string } | null> {
  let { content, type } = await getPageHelper(url);
  if (type === "s3") {
    const path = content;
    content = await fetch(
      "https://augmate-retrieval-content.s3.amazonaws.com/" + path
    ).then((r) => r.text());
    type = path.includes("html") ? "html" : "text-from-pdf";
  }

  if (type === "html") {
    const result = getMainArticle(content);
    if (result) {
      return {
        content: htmlToMarkdown(result.content, {
          ignoreImages: true,
          ignoreLinks: true,
        }),
        title: result.title,
      };
    } else {
      return null;
    }
  } else if (type === "text-from-pdf") {
    return {
      content,
      title: "[PDF]",
    };
  } else {
    throw new Error("Unknown type: " + type);
  }
}

export async function api(path: string, body: any = {}) {
  const response = await fetch(
    `https://7azz4l2unk.execute-api.us-east-1.amazonaws.com/${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("accessToken"),
      },
      body: JSON.stringify({
        ...body,
        token: await getToken(),
      }),
    }
  );
  const result = await response.json();
  if ("error" in result || response.status !== 200) {
    throw new Error(result.error);
  }
  return result;
}

export class Prompt<Variables extends { [key: string]: string }> {
  constructor(public readonly promptId: string) {}

  async call(variables: Variables): Promise<string> {
    const { completion } = await api("prompt", {
      promptId: this.promptId,
      variables,
    });

    return completion;
  }
}

export interface SearchResultPage {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResults {
  pages: SearchResultPage[];
  related_searches: string[];
  query: string;
}
