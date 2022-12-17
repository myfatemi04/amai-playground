import { useEffect, useState } from "react";
import { api } from "../api";
import { PromptVariable } from "./PromptDesigner";

export interface Prompt {
  _id: string;
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
      <div>
        {prompts.map((prompt) => {
          return <>{prompt._id}</>;
        }) || "No prompts yet."}
      </div>
    </>
  );
}
