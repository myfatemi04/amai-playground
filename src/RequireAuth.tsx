import { ReactNode, useContext } from "react";
import DefaultLayout from "./DefaultLayout";
import GoogleLoginButton from "./GoogleLoginButton";
import { UserContext } from "./UserProvider";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, pending } = useContext(UserContext);

  if (user) {
    return <>{children}</>;
  }

  return (
    <DefaultLayout>
      <p>This page requires a log in.</p>
      {pending ? <p>Logging you in...</p> : <GoogleLoginButton />}
    </DefaultLayout>
  );
}
