import { googleOauthUrl } from "./UserProvider";

function login() {
  window.location.href = googleOauthUrl;
}

export default function GoogleLoginButton() {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        border: "1px solid gray",
        borderRadius: "0.5rem",
        padding: "0.5rem",
        background: "white",
      }}
      onClick={login}
    >
      <img
        src="/google-256x256.png"
        alt="Google logo"
        style={{ width: "1.5rem", height: "1.5rem" }}
      />
      <span style={{ marginLeft: "0.5rem" }}>Log in with Google</span>
    </button>
  );
}
