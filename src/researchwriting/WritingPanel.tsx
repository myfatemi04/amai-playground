import { useState } from "react";
import RWResearchPanel from "./ResearchPanel";
import RWTextArea from "./ResearchTextarea";

export default function RWWritingPanel() {
  const [docName, setDocName] = useState("Untitled document");
  const [researchWindowOpen, setResearchWindowOpen] = useState(false);

  return (
    <>
      {researchWindowOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "2rem",
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              onClick={() => setResearchWindowOpen(false)}
              className="link"
              style={{ margin: "0.5rem 0" }}
            >
              Close window
            </button>
            <RWResearchPanel />
          </div>
        </div>
      )}
      <div style={{ fontSize: "0.875rem", marginTop: "1rem" }}>
        <input
          type="text"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
        />
        <p style={{ marginBottom: 0 }}>
          Start typing anything and press <code>ctrl + enter</code> to generate
          text with AI. Press <code>tab</code> or <code>right arrow</code> to
          complete them.
        </p>
        <button
          onClick={() => setResearchWindowOpen(true)}
          style={{ margin: "0.5rem 0" }}
          className="link"
        >
          Sources
        </button>
      </div>
      <div
        style={{
          position: "relative",
          flexGrow: 1,
        }}
      >
        <RWTextArea />
      </div>
    </>
  );
}
