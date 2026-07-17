import { BrowserRouter, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { DocLayout } from "./components/DocLayout";
import { HomePage } from "./pages/HomePage";
import { PackagesPage } from "./pages/PackagesPage";
import { RuntimePage } from "./pages/RuntimePage";
import { StartPage } from "./pages/StartPage";
import { VerticalsPage } from "./pages/VerticalsPage";

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DocLayout />}>
          <Route index element={<HomePage />} />
          <Route path="start" element={<StartPage />} />
          <Route path="verticals" element={<VerticalsPage />} />
          <Route path="runtime" element={<RuntimePage />} />
          <Route path="packages" element={<PackagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
