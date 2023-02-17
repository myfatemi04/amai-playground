import { api } from "../api";

const SUGGESTIONS_PROMPT_ID = "63efd7a0595d2aa0e1efc2c7";

function parseSuggestions(rawCompletion: string) {
  const suggestions = rawCompletion
    .split("\n")
    .map((line) => {
      line = line.trim().replace(/^- /, "");

      if (line.length === 0) {
        return null;
      }

      if (!line.includes(":")) {
        return null;
      }

      const [text, suggestion] = line.split(":", 2);

      return {
        // Remove quotes from the text
        text: text.trim().replace(/^"(.+)"$/, "$1"),
        content: suggestion.trim(),
      };
    })
    .filter((suggestion) => suggestion !== null);

  return suggestions as { text: string; content: string }[];
}

export default async function getSuggestions(text: string) {
  const { completion } = await api("generate_for_prompt", {
    prompt_id: SUGGESTIONS_PROMPT_ID,
    variables: { input_text: text },
  });

  return parseSuggestions("- " + completion);
}
