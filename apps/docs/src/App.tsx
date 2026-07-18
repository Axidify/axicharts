import { BrowserRouter, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { DocLayout } from "./components/DocLayout";
import { HomePage } from "./pages/HomePage";
import { PackagesPage } from "./pages/PackagesPage";
import { PluginsPage } from "./pages/PluginsPage";
import { RuntimePage } from "./pages/RuntimePage";
import { RuntimeAdaptersPage } from "./pages/RuntimeAdaptersPage";
import { RuntimeDeepLinkPage } from "./pages/RuntimeDeepLinkPage";
import { RuntimeImportPage } from "./pages/RuntimeImportPage";
import { RuntimeSchemaPage } from "./pages/RuntimeSchemaPage";
import { SpecPage } from "./pages/SpecPage";
import { StartPage } from "./pages/StartPage";
import { VerticalsPage } from "./pages/VerticalsPage";
import { ComparePage } from "./pages/ComparePage";
import { ShadcnPage } from "./pages/ShadcnPage";
import { ShadcnRegistryPage } from "./pages/ShadcnRegistryPage";
import { CommunityTemplatesPage } from "./pages/CommunityTemplatesPage";

export function App(): ReactElement {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<DocLayout />}>
          <Route index element={<HomePage />} />
          <Route path="start" element={<StartPage />} />
          <Route path="verticals" element={<VerticalsPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="shadcn" element={<ShadcnPage />} />
          <Route path="shadcn/registry" element={<ShadcnRegistryPage />} />
          <Route path="templates/community" element={<CommunityTemplatesPage />} />
          <Route path="spec" element={<SpecPage />} />
          <Route path="runtime" element={<RuntimePage />} />
          <Route path="runtime/adapters" element={<RuntimeAdaptersPage />} />
          <Route path="runtime/schema" element={<RuntimeSchemaPage />} />
          <Route path="runtime/import" element={<RuntimeImportPage />} />
          <Route path="runtime/links" element={<RuntimeDeepLinkPage />} />
          <Route path="plugins" element={<PluginsPage />} />
          <Route path="packages" element={<PackagesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
