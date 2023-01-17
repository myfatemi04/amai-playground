import chunkText from "./chunkText";

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
