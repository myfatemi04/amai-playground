import { ReactNode } from "react";

function Header({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
      }}
    >
      <img
        src="/logo192.png"
        alt="AugmateAI Logo"
        style={{ width: "3rem", height: "3rem" }}
      />
      <span
        style={{
          display: "inline-block",
          fontSize: "3rem",
          fontWeight: "bold",
          marginTop: 0,
          marginBottom: 0,
          marginLeft: "0.5rem",
        }}
      >
        {children}
      </span>
    </div>
  );
}

export default Header;
