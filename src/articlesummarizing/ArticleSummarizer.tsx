import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "../api";
import Button from "../Button";

export default function ArticleSummarizer({ markdown }: { markdown: string }) {
  const [instruction, setInstruction] = useState("");
  const [completion, setCompletion] = useState<string | null>(null);

  const generateCompletions = useCallback(() => {
    api("generate_for_prompt", {
      prompt_id: "639695953ee71dbb54be8165",
      variables: {
        title: "No title",
        content: markdown,
        context: instruction,
      },
    })
      .then(({ completion }) => setCompletion(completion))
      .catch((e) => {
        console.error(e);
      });
  }, [instruction, markdown]);

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
      {completion ? (
        <>
          <p>Answer</p>
          <pre>{completion.trim()}</pre>
        </>
      ) : (
        <p>No answer yet</p>
      )}
      <h1>Detected Content</h1>
      <ReactMarkdown children={markdown} />
    </div>
  );
}
