import { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

/*
One column, all black: Header, content, footer.
*/
export default function DefaultLayout({
  children,
  white = false,
  fullscreen = false,
}: {
  children: ReactNode;
  white?: boolean;
  fullscreen?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        ...(fullscreen ? { height: "100vh" } : { minHeight: "100vh" }),
      }}
    >
      <Header>AugmateAI</Header>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 2rem",
          flexGrow: "1",
          minHeight: 0,
        }}
        className={white ? "white" : "black"}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
