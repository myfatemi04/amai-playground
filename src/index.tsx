import React from "react";
import ReactDOM from "react-dom/client";
import Research from "./Research";
import "./index.css";
import Generation from "./Generation";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import NotFound from "./NotFound";
import Home from "./Home";
import ResearchWriting from "./researchwriting/ResearchWriting";
import UserProvider, { googleOauthUrl } from "./UserProvider";
import GoogleCallback from "./GoogleCallback";
import RequireAuth from "./RequireAuth";
import Rap from "./promptexamples/Rap";

const Redirect = () => {
  window.location.href = googleOauthUrl;

  return (
    <div
      style={{
        margin: "4rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <p>Redirecting...</p>
      <p>
        If you are not redirected, click <a href={googleOauthUrl}>here</a>.
      </p>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/">
            <Route path="prompt-examples">
              <Route
                path="rap"
                element={
                  <RequireAuth>
                    <Rap />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="generation" element={<Generation />} />
            <Route path="research" element={<Research />} />
            <Route
              path="researchwriting"
              element={
                <RequireAuth>
                  <ResearchWriting />
                </RequireAuth>
              }
            />
            <Route path="google-auth" element={<Redirect />} />
            <Route path="google-callback" element={<GoogleCallback />} />
            <Route path="*" element={<NotFound />} />
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
