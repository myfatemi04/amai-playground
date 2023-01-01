import { ReactNode, useContext } from "react";
import { UserContext } from "./UserProvider";

function Header({ children }: { children: ReactNode }) {
  const { user } = useContext(UserContext);

  return (
    <a
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
        textDecoration: "none",
      }}
      href="/"
    >
      <img
        src="/logo192.png"
        alt="AugmateAI Logo"
        style={{ width: "3rem", height: "3rem", border: "1px solid white" }}
      />
      <span
        style={{
          display: "inline-block",
          fontSize: "3rem",
          fontWeight: "bold",
          marginTop: 0,
          marginBottom: 0,
          marginLeft: "0.5rem",
          textShadow: "0 0 2rem rgba(255, 127, 255, 0.25)",
        }}
      >
        {children}
      </span>
      <span style={{ marginLeft: "auto" }} />
      {user ? <span>{user.name}</span> : <span>Not signed in</span>}
    </a>
  );
}

export default Header;
