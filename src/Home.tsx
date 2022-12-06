import Header from "./Header";

export default function Home() {
  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        width: "calc(min(100vw, max(60vw, 40rem)))",
        margin: "0 auto",
        alignItems: "center",
      }}
    >
      <Header>AugmateAI</Header>
      <span>
        by <a href="https://michaelfatemi.com/">Michael Fatemi</a>, November
        2022
      </span>
      <br />

      <span>
        Save 90% of your time with Augmate AI.
        <br />
        <br />
        Generate text by pressing control + enter in any textbox.
        <br />
        <br />
        Right arrow to accept, backspace to reject.
      </span>
      <br />
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
      <a
        href="/generation"
        target="_blank"
        rel="noreferrer"
      >
        Try it yourself!
      </a>
      <br />
      <b>Give any instruction</b>
      <span style={{ fontSize: "0.5rem" }}>
        Note: Only works for news articles right now, such as Seeking Alpha and
        Substack.
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
  );
}
