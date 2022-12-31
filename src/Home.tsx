import Button from "./Button";
import Header from "./Header";

export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "#111111",
        color: "white",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
      }}
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
          style={{ display: "flex", marginTop: "3rem", marginBottom: "7rem" }}
        >
          <Button background={{ from: "#e22", to: "#f22" }} foreground="white">
            Join
          </Button>
          <Button
            background="#111111"
            foreground="white"
            border="0.1rem solid #f22"
            margin="0 0 0 1rem"
          >
            Sign in
          </Button>
        </div>
        {/* <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            color: "black",
            width: "100%",
          }}
        >
          <p>
            <b>Try it yourself!</b>
          </p>
          <input type="text" />
        </div> */}
        <h1>Some examples</h1>
        <ol>
          <li>
            <a href="/prompt-examples/rap">
              Generate (and perform!) a hip-hop rap
            </a>
            <a href="/web">
              Answer questions about scientific papers and external websites (including PDFs)
            </a>
          </li>
        </ol>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            color: "black",
            background: "white",
          }}
        >
          <video width="600" height="400" muted autoPlay loop>
            <source src="content/AMAIDemo.mp4" type="video/mp4" />
          </video>
          <div style={{ lineHeight: "1.5rem" }}>
            Available on the{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://chrome.google.com/webstore/detail/augmate-ai/dceioblamkhclhgcmelaakbjeedpmhnf"
            >
              Chrome WebStore
            </a>
            .
            <br />
            <span>
              Fill out{" "}
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSck6ey9n-hTx1C87m07JTMkK9-KEKNWmQlQYEorkANDnGqKDw/viewform">
                this form
              </a>{" "}
              to request access.
            </span>
            <br />
            <span style={{ fontSize: "0.5rem" }}>
              Google Docs compatibility coming soon!
            </span>
          </div>
          <a href="/generation" target="_blank" rel="noreferrer">
            Try it yourself!
          </a>
          <br />
          <b>Give any instruction</b>
          <span style={{ fontSize: "0.5rem" }}>
            Note: Only works for news articles right now, such as Seeking Alpha
            and Substack.
          </span>
          <img
            src="content/AMAISS5.png"
            alt="Give any instruction"
            style={{ maxWidth: "40rem" }}
          />
          <br />
          <img
            src="content/AMAISS1.png"
            alt="Generate emails and LinkedIn messages"
            style={{ maxWidth: "40rem" }}
          />
          <span>
            <b>Summarize Long Articles</b>
          </span>
          <img
            src="content/AMAISS4.png"
            alt="Summarize long articles"
            style={{ maxWidth: "40rem" }}
          />
        </div>
      </div>
    </div>
  );
}
