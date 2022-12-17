import { PromptVariable } from "./PromptDesigner";

const API_BASE_URL = "https://augmateai-inference.michaelfatemi.com";
// These seem pointless but are used so the formatting in the <pre> section doesn't get messed up.
const TWO_SPACES = "  ";
const FOUR_SPACES = "    ";

export default function PromptUsage({
  promptId,
  variables,
}: {
  promptId: string;
  variables: PromptVariable[];
}) {
  return (
    <div>
      <h3>Usage</h3>
      <pre>
        POST {API_BASE_URL}/inference
        <br />
        {`{
${TWO_SPACES}"promptId": "${promptId}",
${TWO_SPACES}"variables": {
${FOUR_SPACES}${variables
          .map(
            (variable) =>
              `"${variable.name}": ${
                variable.type === "float" ? "12.34" : '"Test string"'
              }`
          )
          .join(",\n" + FOUR_SPACES)}
${TWO_SPACES}}
}`}
      </pre>
    </div>
  );
}
