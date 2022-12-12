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

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/">
          <Route path="generation" element={<Generation />} />
          <Route path="research" element={<Research />} />
          <Route path="researchwriting" element={<ResearchWriting />} />
          <Route path="*" element={<NotFound />} />
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
