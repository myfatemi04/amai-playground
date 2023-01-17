import { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

/*
One column, all black: Header, content, footer.
*/
export default function DefaultLayout({
  children,
  white = false,
}: {
  children: ReactNode;
  white?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <Header>AugmateAI</Header>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 2rem",
          flexGrow: "1",
        }}
        className={white ? "white" : "black"}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
