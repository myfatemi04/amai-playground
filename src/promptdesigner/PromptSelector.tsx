import { useEffect, useState } from "react";
import { api } from "../api";
import { PromptVariable } from "./PromptDesigner";

export interface Prompt {
  _id: string;
  name: string;
  template: string;
  user_id: string;
  variables: PromptVariable[];
}

export default function PromptSelector() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    api("get_prompts").then(setPrompts);
  }, []);

  return (
    <>
      <h3>Choose a prompt</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          border: "1px solid black",
          padding: "1rem",
          borderRadius: "0.5rem",
        }}
      >
        {prompts.map((prompt) => {
          return (
            <div
              style={{ cursor: "pointer", margin: "0.5rem 0" }}
              onClick={() => {
                window.location.href =
                  "/prompt-designer?promptId=" + prompt._id;
              }}
            >
              <b>{prompt.name ?? "Unnamed prompt"}</b>
            </div>
          );
        }) || "No prompts yet."}
      </div>
    </>
  );
}
