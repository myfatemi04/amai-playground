import { Readability } from "@mozilla/readability";
import { api } from "../api";

async function getPageHtml(url: string) {
  const { result } = await api("retrieval_enhancement", {
    backend: "proxy",
    query: url,
  });
  return result as string;
}

function parse(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const reader = new Readability(document);
  const article = reader.parse();
  return article;
}

export default async function getUrlText(url: string) {
  const html = await getPageHtml(url);
  const article = parse(html);
  return article?.content ?? null;
}
