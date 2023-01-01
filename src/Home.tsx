import { useContext } from "react";
import Button from "./Button";
import Header from "./Header";
import { UserContext } from "./UserProvider";

export default function Home() {
  const { user } = useContext(UserContext);

  return (
    <div
      style={{
        padding: "2rem 2rem 0",
        display: "flex",
        flexDirection: "column",
      }}
      className="black"
    >
      <Header>AugmateAI</Header>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "3rem",
            textShadow: "0 0 0.25rem rgba(255, 255, 255, 0.5)",
          }}
        >
          Become a 10x creator
        </h1>
        <p>Accelerate yourself with AI.</p>
        <div
          style={{ display: "flex", marginTop: "3rem", marginBottom: "3rem" }}
        >
          {!user ? (
            <Button
              background="#111111"
              foreground="white"
              border="0.1rem solid #f22"
              onClick={() => {
                window.location.href = "/google-auth";
              }}
            >
              Sign in
            </Button>
          ) : (
            <>
              <Button
                background="#111111"
                foreground="white"
                border="0.1rem solid #f22"
                onClick={() => {
                  window.location.href = "/web";
                }}
              >
                AI Reading
              </Button>
              <Button
                background="#111111"
                foreground="white"
                border="0.1rem solid #f22"
                margin="0 0 0 1rem"
                onClick={() => {
                  window.location.href = "/researchwriting";
                }}
              >
                AI Writing
              </Button>
            </>
          )}
        </div>
        <span style={{ margin: "2rem 0" }}>
          Fill out{" "}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSck6ey9n-hTx1C87m07JTMkK9-KEKNWmQlQYEorkANDnGqKDw/viewform">
            this form
          </a>{" "}
          to {!user && "request access or"} provide feedback
        </span>
        <div
          style={{
            width: "100%",
            padding: "2rem",
          }}
          className="white"
        >
          <div className="article">
            <h1>Some examples</h1>
            <h2>Answer Questions</h2>
            <p>
              Having trouble reading a dense scientific paper or textbook? Paste
              the link to the website (or PDF) and have GPT-3 answer questions
              about it with my <a href="/web">research tool</a>.
            </p>
            <p>
              You can also do it for YouTube videos at{" "}
              <a href="/youtube">this page</a>.
            </p>
            <h2>Write Faster</h2>
            <p>
              Write faster with my <a href="/researchwriting">writing tool</a>.
              If you want to write something informative, but you don't think
              GPT-3 will get the answer right, you can search for an article
              that might have the answer, <b>drag and drop</b> it into your
              document, and have GPT-3 use that article as a reference to write
              the answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
