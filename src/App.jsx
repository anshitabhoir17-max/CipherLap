import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { HomePage } from "./pages/HomePage";
import { ToolsPage } from "./pages/ToolsPage";
import { PhishingPage } from "./pages/PhishingPage";
import { BreachPage } from "./pages/BreachPage";
import { UrlPage } from "./pages/UrlPage";
import { ImagePage } from "./pages/ImagePage";
import { StegoPage } from "./pages/StegoPage";
import { MorsePage } from "./pages/MorsePage";

export default function App({ authEnabled }) {
  return (
    <SiteLayout authEnabled={authEnabled}>
      <Routes>
        <Route path="/" element={<HomePage authEnabled={authEnabled} />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/phishing" element={<PhishingPage authEnabled={authEnabled} />} />
        <Route path="/tools/pwned-email" element={<BreachPage authEnabled={authEnabled} />} />
        <Route path="/tools/url-scanner" element={<UrlPage authEnabled={authEnabled} />} />
        <Route path="/tools/ai-image" element={<ImagePage authEnabled={authEnabled} />} />
        <Route path="/tools/hidden-message" element={<StegoPage authEnabled={authEnabled} />} />
        <Route path="/tools/morse-lab" element={<MorsePage authEnabled={authEnabled} />} />
      </Routes>
    </SiteLayout>
  );
}
