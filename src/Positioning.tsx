import { ReactNode } from "react";

export default function Positioning({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        height: "100vh",
        width: "calc(min(100vw, max(80vw, 40rem)))",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
