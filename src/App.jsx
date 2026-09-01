import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";

const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const HomePage = lazyNamed(() => import("./pages/HomePage"), "HomePage");
const ToolsPage = lazyNamed(() => import("./pages/ToolsPage"), "ToolsPage");
const CareerRoadmapPage = lazyNamed(() => import("./pages/CareerRoadmapPage"), "CareerRoadmapPage");
const CareerRolePage = lazyNamed(() => import("./pages/CareerRolePage"), "CareerRolePage");
const BreachPage = lazyNamed(() => import("./pages/BreachPage"), "BreachPage");
const ImagePage = lazyNamed(() => import("./pages/ImagePage"), "ImagePage");
const StegoPage = lazyNamed(() => import("./pages/StegoPage"), "StegoPage");
const EmailHeadersPage = lazyNamed(() => import("./pages/EmailHeadersPage"), "EmailHeadersPage");
const DomainIntelPage = lazyNamed(() => import("./pages/DomainIntelPage"), "DomainIntelPage");
const PasswordSafetyPage = lazyNamed(() => import("./pages/PasswordSafetyPage"), "PasswordSafetyPage");
const HashLabPage = lazyNamed(() => import("./pages/HashLabPage"), "HashLabPage");
const FileHashPage = lazyNamed(() => import("./pages/FileHashPage"), "FileHashPage");
const MetadataPage = lazyNamed(() => import("./pages/MetadataPage"), "MetadataPage");
const QrExtractorPage = lazyNamed(() => import("./pages/QrExtractorPage"), "QrExtractorPage");
const IncidentReportPage = lazyNamed(() => import("./pages/IncidentReportPage"), "IncidentReportPage");
const AwarenessQuizPage = lazyNamed(() => import("./pages/AwarenessQuizPage"), "AwarenessQuizPage");
const OwaspTop10Page = lazyNamed(() => import("./pages/OwaspTop10Page"), "OwaspTop10Page");
const OwaspTop10DetailPage = lazyNamed(() => import("./pages/OwaspTop10DetailPage"), "OwaspTop10DetailPage");
const CommandGuidePage = lazyNamed(() => import("./pages/CommandGuidePage"), "CommandGuidePage");
const OutputTranslatorPage = lazyNamed(() => import("./pages/OutputTranslatorPage"), "OutputTranslatorPage");
const NetworkTroubleshootingPage = lazyNamed(() => import("./pages/NetworkTroubleshootingPage"), "NetworkTroubleshootingPage");
const NetworkScannerPage = lazyNamed(() => import("./pages/NetworkScannerPage"), "NetworkScannerPage");

export default function App({ authEnabled }) {
  return (
    <SiteLayout authEnabled={authEnabled}>
      <Suspense
        fallback={
          <section className="tool-result">
            <h3>Loading Workspace</h3>
            <p className="result-summary">Preparing the selected tool page...</p>
          </section>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage authEnabled={authEnabled} />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/phishing" element={<Navigate replace to="/tools" />} />
          <Route path="/tools/pwned-email" element={<BreachPage authEnabled={authEnabled} />} />
          <Route path="/tools/url-scanner" element={<Navigate replace to="/tools" />} />
          <Route path="/tools/ai-image" element={<ImagePage authEnabled={authEnabled} />} />
          <Route path="/tools/hidden-message" element={<StegoPage authEnabled={authEnabled} />} />
          <Route path="/tools/morse-lab" element={<Navigate replace to="/tools" />} />
          <Route path="/tools/email-headers" element={<EmailHeadersPage authEnabled={authEnabled} />} />
          <Route path="/tools/domain-intelligence" element={<DomainIntelPage authEnabled={authEnabled} />} />
          <Route path="/tools/security-headers" element={<Navigate replace to="/tools" />} />
          <Route path="/tools/password-safety" element={<PasswordSafetyPage authEnabled={authEnabled} />} />
          <Route path="/tools/hash-lab" element={<HashLabPage authEnabled={authEnabled} />} />
          <Route path="/tools/file-hash" element={<FileHashPage authEnabled={authEnabled} />} />
          <Route path="/tools/metadata-inspector" element={<MetadataPage authEnabled={authEnabled} />} />
          <Route path="/tools/qr-extractor" element={<QrExtractorPage authEnabled={authEnabled} />} />
          <Route path="/tools/incident-report" element={<IncidentReportPage authEnabled={authEnabled} />} />
          <Route path="/tools/ioc-checker" element={<Navigate replace to="/tools" />} />
          <Route path="/tools/jwt-decoder" element={<Navigate replace to="/tools" />} />
          <Route path="/tools/awareness-quiz" element={<AwarenessQuizPage authEnabled={authEnabled} />} />
          <Route path="/tools/owasp-top10" element={<OwaspTop10Page authEnabled={authEnabled} />} />
          <Route path="/tools/owasp-top10/:vulnId" element={<OwaspTop10DetailPage authEnabled={authEnabled} />} />
          <Route path="/tools/command-guide" element={<CommandGuidePage authEnabled={authEnabled} />} />
          <Route path="/tools/output-translator" element={<OutputTranslatorPage authEnabled={authEnabled} />} />
          <Route path="/tools/network-troubleshooting" element={<NetworkTroubleshootingPage authEnabled={authEnabled} />} />
          <Route path="/tools/network-scanner" element={<NetworkScannerPage authEnabled={authEnabled} />} />
          <Route path="/career" element={<CareerRoadmapPage />} />
          <Route path="/career/:roleId" element={<CareerRolePage />} />
        </Routes>
      </Suspense>
    </SiteLayout>
  );
}
