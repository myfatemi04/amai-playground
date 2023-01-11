import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AccountPage from "./accountpage/AccountPage";
import Generation from "./Generation";
import GoogleCallback from "./GoogleCallback";
import Home from "./Home";
import "./index.scss";
import Interactive from "./interactive/Interactive";
import NotFound from "./NotFound";
import PromptDesigner from "./promptdesigner/PromptDesigner";
import Rap from "./promptexamples/Rap";
import reportWebVitals from "./reportWebVitals";
import RequireAuth from "./RequireAuth";
import Research from "./Research";
import ResearchWriting from "./researchwriting/ResearchWriting";
import UserProvider, { googleOauthUrl } from "./UserProvider";
import WebContentPage from "./webcontent/WebContentPage";
import YoutubeVideos from "./youtubevideos/YoutubeVideos";

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
          <Route
            path="youtube"
            element={
              <RequireAuth>
                <YoutubeVideos />
              </RequireAuth>
            }
          />
          <Route
            path="web"
            element={
              <RequireAuth>
                <WebContentPage />
              </RequireAuth>
            }
          />
          <Route
            path="prompt-designer"
            element={
              <RequireAuth>
                <PromptDesigner
                  promptId={new URL(window.location.href).searchParams.get(
                    "promptId"
                  )}
                />
              </RequireAuth>
            }
          />
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
          <Route
            path="generation"
            element={
              <RequireAuth>
                <Generation />
              </RequireAuth>
            }
          />
          <Route
            path="research"
            element={
              <RequireAuth>
                <Research />
              </RequireAuth>
            }
          />
          <Route
            path="researchwriting"
            element={
              <RequireAuth>
                <ResearchWriting />
              </RequireAuth>
            }
          />
          <Route
            path="interactive"
            element={
              <RequireAuth>
                <Interactive />
              </RequireAuth>
            }
          />
          <Route
            path="account"
            element={
              <RequireAuth>
                <AccountPage />
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
