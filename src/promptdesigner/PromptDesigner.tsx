import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import Header from "../Header";
import Positioning from "../Positioning";
import usePrevious from "../usePrevious";
import PromptSelector, { Prompt } from "./PromptSelector";
import PromptUsage from "./PromptUsage";

export type PromptVariable = {
  type: "float" | "string";
  name: string;
};

export default function PromptDesigner({
  promptId,
}: {
  promptId: string | null;
}) {
  const [name, setName] = useState("");
  const previousName = usePrevious(name);
  const [variables, setVariables] = useState<PromptVariable[]>([]);
  const [template, setTemplate] = useState("");
  const addVariable = useCallback(() => {
    setVariables((variables) => {
      // Generate a unique variable name
      let newVariableNameCounter = 1;
      let existingVariableNames = new Set(
        variables.map((variable) => variable.name)
      );
      while (
        existingVariableNames.has("New variable #" + newVariableNameCounter)
      ) {
        newVariableNameCounter++;
      }
      // Return the new variables list
      return [
        ...variables,
        {
          name: "New variable #" + newVariableNameCounter,
          type: "string",
        },
      ];
    });
  }, []);

  useEffect(() => {
    api("get_prompts").then((prompts: Prompt[]) => {
      const found = prompts.find((prompt) => prompt._id === promptId);
      if (found) {
        setName(found.name);
        setVariables(found.variables);
        setTemplate(found.template);
      }
    });
  }, [promptId]);

  useEffect(() => {
    if (previousName && name && name !== previousName) {
      const timeout = setTimeout(() => {
        api("update_prompt", { prompt_id: promptId, new_name: name })
          .then(() => {
            console.log("Saved");
          })
          .catch(console.error);
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [name, previousName, promptId]);

  if (promptId === null) {
    return (
      <Positioning>
        <Header>Prompt Designer</Header>
        <PromptSelector />
      </Positioning>
    );
  }

  return (
    <Positioning>
      <Header>Prompt Designer</Header>
      <div
        style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}
      >
        <a href="/prompt-designer">Back</a>
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <PromptUsage variables={variables} promptId={promptId} />
      </div>
      <div style={{ display: "flex", flexGrow: 1 }}>
        <div style={{ flex: 1, padding: "0.5rem" }}>
          <h3 style={{ margin: 0 }}>Prompt Variables</h3>
          <button onClick={addVariable} style={{ margin: "0.5rem 0" }}>
            Add variable
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {variables.map((variable, index) => (
              <div
                style={{ display: "flex", marginBottom: "0.5rem" }}
                key={variable.name}
              >
                <input
                  type="text"
                  placeholder="New variable..."
                  value={variable.name}
                  onChange={(e) => {
                    setVariables((variables) => [
                      ...variables.slice(0, index),
                      { ...variables[index], name: e.target.value },
                      ...variables.slice(index + 1),
                    ]);
                  }}
                />
                <select
                  style={{ marginLeft: "0.5rem" }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== "float" && value !== "string") {
                      return;
                    }
                    setVariables((variables) => [
                      ...variables.slice(0, index),
                      { ...variables[index], type: value },
                      ...variables.slice(index + 1),
                    ]);
                  }}
                >
                  <option value="string">String</option>
                  <option value="float">Number</option>
                </select>
                <button
                  onClick={() => {
                    setVariables((variables) => [
                      ...variables.slice(0, index),
                      ...variables.slice(index + 1),
                    ]);
                  }}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 3,
            padding: "0.5rem",
          }}
        >
          <h3 style={{ margin: 0 }}>Template</h3>
          <textarea
            style={{
              padding: "0.5rem",
              flexGrow: 1,
              marginTop: "0.5rem",
              fontFamily: "Arial, sans-serif",
            }}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </div>
      </div>
    </Positioning>
  );
}
