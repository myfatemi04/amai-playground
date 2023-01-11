import { ReactNode, useContext } from "react";
import { UserContext } from "./UserProvider";

function Header({ children }: { children: ReactNode }) {
  const { user } = useContext(UserContext);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
        padding: "2rem",
        width: "100%",
        boxSizing: "border-box",
      }}
      className="black"
    >
      <a
        href="/"
        style={{ display: "flex", alignItems: "center" }}
        className="no-deco"
      >
        <img
          src="/logo192.png"
          alt="AugmateAI Logo"
          style={{ width: "2rem", height: "2rem", border: "1px solid white" }}
        />
        <span
          style={{
            display: "inline-block",
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginTop: 0,
            marginBottom: 0,
            marginLeft: "0.5rem",
            textShadow: "0 0 2rem rgba(255, 127, 255, 0.25)",
          }}
        >
          {children}
        </span>
      </a>
      <span style={{ marginLeft: "auto" }} />
      {user ? (
        <a href="/account" className="no-deco">
          {user.name}
        </a>
      ) : (
        <span>Not signed in</span>
      )}
    </div>
  );
}

export default Header;
