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
import { BlocksPlaygroundPage } from "./pages/BlocksPlaygroundPage";
import { StartPage } from "./pages/StartPage";
import { VerticalsPage } from "./pages/VerticalsPage";
import { ComparePage } from "./pages/ComparePage";
import { ShadcnPage } from "./pages/ShadcnPage";
import { ShadcnRegistryPage } from "./pages/ShadcnRegistryPage";
import { AgentCartesianGuidePage } from "./pages/AgentCartesianGuidePage";
import { BrandingPage } from "./pages/BrandingPage";
import { ThemePlaygroundPage } from "./pages/ThemePlaygroundPage";
import { BenchmarksPage } from "./pages/BenchmarksPage";
import { TroubleshootingPage } from "./pages/TroubleshootingPage";
import { VersionMatrixPage } from "./pages/VersionMatrixPage";
import { ChoosingPathPage } from "./pages/ChoosingPathPage";
import { CsvDashboardGuidePage } from "./pages/CsvDashboardGuidePage";
import { ImportsGuidePage } from "./pages/ImportsGuidePage";
import { CommunityTemplatesPage } from "./pages/CommunityTemplatesPage";

export function App(): ReactElement {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<DocLayout />}>
          <Route index element={<HomePage />} />
          <Route path="start" element={<StartPage />} />
          <Route path="guides/choosing-your-path" element={<ChoosingPathPage />} />
          <Route path="guides/imports" element={<ImportsGuidePage />} />
          <Route path="benchmarks" element={<BenchmarksPage />} />
          <Route path="guides/theme" element={<ThemePlaygroundPage />} />
          <Route path="guides/branding" element={<BrandingPage />} />
          <Route path="guides/agent-cartesian" element={<AgentCartesianGuidePage />} />
          <Route path="guides/csv-dashboard" element={<CsvDashboardGuidePage />} />
          <Route path="guides/versions" element={<VersionMatrixPage />} />
          <Route path="guides/troubleshooting" element={<TroubleshootingPage />} />
          <Route path="verticals" element={<VerticalsPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="shadcn" element={<ShadcnPage />} />
          <Route path="shadcn/registry" element={<ShadcnRegistryPage />} />
          <Route path="templates/community" element={<CommunityTemplatesPage />} />
          <Route path="spec" element={<SpecPage />} />
          <Route path="spec/blocks" element={<BlocksPlaygroundPage />} />
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
