import { useEffect, useState } from "react";
import { api } from "./api";
import GoogleLoginButton from "./GoogleLoginButton";
import Header from "./Header";

export default function GoogleCallback() {
  const code = new URLSearchParams(window.location.search).get("code");
  const [status, setStatus] = useState<
    null | "pending" | "error" | "authenticated"
  >("authenticated");

  useEffect(() => {
    api("oauth", {
      code,
      host: window.location.hostname,
    })
      .then((response) => {
        if (response.access_token) {
          // Redirect.
          window.location.href = "/";
          setStatus("authenticated");
          localStorage.setItem("accessToken", response.access_token);
        }
      })
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });
  }, [code]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "4rem",
        alignItems: "center",
        margin: "auto",
      }}
    >
      <Header>Logging you in...</Header>
      <br />
      {status === "authenticated" && (
        <div>
          Logged in successfully! You should be redirected soon. If not, click{" "}
          <a href="/">here</a>.
        </div>
      )}
      {status === "error" && (
        <div>
          <p>There was an error logging you in. You can try again:</p>
          <GoogleLoginButton />
        </div>
      )}
    </div>
  );
}
