export async function getToken(): Promise<string> {
  if (window.location.pathname === "/researchwriting") {
    return "$research-writing";
  } else {
    return "$playground";
  }
}

export async function getSearchResults(query: string): Promise<SearchResults> {
  const { result } = await api("retrieval_enhancement", {
    backend: "bing",
    query,
  });
  return { ...result, query };
}

export async function api(path: string, body: any = {}) {
  const result = await fetch(
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
  return await result.json();
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
