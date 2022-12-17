import { useCallback, useState } from "react";
import Header from "../Header";
import Positioning from "../Positioning";
import PromptSelector from "./PromptSelector";
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
      <PromptUsage variables={variables} promptId={promptId} />
      <div style={{ display: "flex", flexGrow: 1 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>Prompt Variables</h3>
          <button onClick={addVariable} style={{ margin: "0.5rem 0" }}>
            Add variable
          </button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {variables.map((variable, index) => (
              <div style={{ display: "flex", marginBottom: "0.5rem" }}>
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
                <select style={{ marginLeft: "0.5rem" }}>
                  <option value="float">Number</option>
                  <option value="string">String</option>
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
        <div style={{ display: "flex", flexDirection: "column", flex: 3 }}>
          <h3 style={{ margin: 0 }}>Prompt</h3>
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
