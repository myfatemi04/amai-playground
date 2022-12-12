import { ReactNode, useContext } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import Header from "./Header";
import { UserContext } from "./UserProvider";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, pending } = useContext(UserContext);

  if (user) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        inset: 0,
        padding: "4rem",
      }}
    >
      <Header>AugmateAI</Header>
      <p>This page requires a log in.</p>
      {pending && <p>Logging you in...</p>}
      {!pending && <GoogleLoginButton />}
    </div>
  );
}
