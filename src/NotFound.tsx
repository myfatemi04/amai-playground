import Header from "./Header";

function NotFound() {
  return (
    <div
      style={{
        margin: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Header>AugmateAI</Header>
      <p>We're sorry, but we couldn't find the page you were looking for.</p>
      <a href="https://augmateai.michaelfatemi.com/">AugmateAI Homepage</a>
    </div>
  );
}

export default NotFound;
