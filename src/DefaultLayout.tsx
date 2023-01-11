import { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

/*
One column, all black: Header, content, footer.
*/
export default function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
      className="black"
    >
      <Header>AugmateAI</Header>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 2rem",
          flexGrow: "1",
        }}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
