import { ReactNode } from "react";

export default function Button({
  background,
  foreground,
  border = null,
  margin,
  onClick = () => {},
  children,
}: {
  background: { from: string; to: string } | string;
  foreground: string;
  border?: null | string;
  onClick?: () => void;
  margin?: string;
  children: ReactNode;
}) {
  return (
    <button
      style={{
        boxShadow: "0 0 1rem rgba(255, 255, 255, 0.25)",
        background:
          typeof background === "string"
            ? background
            : `linear-gradient(0deg, ${background.from} 0%, ${background.to} 100%)`,
        border: border === null ? 0 : border,
        borderRadius: "0.25rem",
        fontWeight: "bold",
        fontSize: "1rem",
        fontFamily: "-apple-system, sans-serif",
        padding: "0.75rem 1.5rem",
        color: foreground,
        cursor: "pointer",
        margin,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
