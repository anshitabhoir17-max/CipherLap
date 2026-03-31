import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";

const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const HomePage = lazyNamed(() => import("./pages/HomePage"), "HomePage");
const ToolsPage = lazyNamed(() => import("./pages/ToolsPage"), "ToolsPage");
const PhishingPage = lazyNamed(() => import("./pages/PhishingPage"), "PhishingPage");
const BreachPage = lazyNamed(() => import("./pages/BreachPage"), "BreachPage");
const UrlPage = lazyNamed(() => import("./pages/UrlPage"), "UrlPage");
const ImagePage = lazyNamed(() => import("./pages/ImagePage"), "ImagePage");
const StegoPage = lazyNamed(() => import("./pages/StegoPage"), "StegoPage");
const MorsePage = lazyNamed(() => import("./pages/MorsePage"), "MorsePage");
const EmailHeadersPage = lazyNamed(() => import("./pages/EmailHeadersPage"), "EmailHeadersPage");
const DomainIntelPage = lazyNamed(() => import("./pages/DomainIntelPage"), "DomainIntelPage");
const SecurityHeadersPage = lazyNamed(() => import("./pages/SecurityHeadersPage"), "SecurityHeadersPage");
const PasswordSafetyPage = lazyNamed(() => import("./pages/PasswordSafetyPage"), "PasswordSafetyPage");
const HashLabPage = lazyNamed(() => import("./pages/HashLabPage"), "HashLabPage");
const FileHashPage = lazyNamed(() => import("./pages/FileHashPage"), "FileHashPage");
const MetadataPage = lazyNamed(() => import("./pages/MetadataPage"), "MetadataPage");
const QrExtractorPage = lazyNamed(() => import("./pages/QrExtractorPage"), "QrExtractorPage");
const IncidentReportPage = lazyNamed(() => import("./pages/IncidentReportPage"), "IncidentReportPage");
const CaseNotesPage = lazyNamed(() => import("./pages/CaseNotesPage"), "CaseNotesPage");
const IocPage = lazyNamed(() => import("./pages/IocPage"), "IocPage");
const JwtPage = lazyNamed(() => import("./pages/JwtPage"), "JwtPage");
const AwarenessQuizPage = lazyNamed(() => import("./pages/AwarenessQuizPage"), "AwarenessQuizPage");

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
          <Route path="/tools/phishing" element={<PhishingPage authEnabled={authEnabled} />} />
          <Route path="/tools/pwned-email" element={<BreachPage authEnabled={authEnabled} />} />
          <Route path="/tools/url-scanner" element={<UrlPage authEnabled={authEnabled} />} />
          <Route path="/tools/ai-image" element={<ImagePage authEnabled={authEnabled} />} />
          <Route path="/tools/hidden-message" element={<StegoPage authEnabled={authEnabled} />} />
          <Route path="/tools/morse-lab" element={<MorsePage authEnabled={authEnabled} />} />
          <Route path="/tools/email-headers" element={<EmailHeadersPage authEnabled={authEnabled} />} />
          <Route path="/tools/domain-intelligence" element={<DomainIntelPage authEnabled={authEnabled} />} />
          <Route path="/tools/security-headers" element={<SecurityHeadersPage authEnabled={authEnabled} />} />
          <Route path="/tools/password-safety" element={<PasswordSafetyPage authEnabled={authEnabled} />} />
          <Route path="/tools/hash-lab" element={<HashLabPage authEnabled={authEnabled} />} />
          <Route path="/tools/file-hash" element={<FileHashPage authEnabled={authEnabled} />} />
          <Route path="/tools/metadata-inspector" element={<MetadataPage authEnabled={authEnabled} />} />
          <Route path="/tools/qr-extractor" element={<QrExtractorPage authEnabled={authEnabled} />} />
          <Route path="/tools/incident-report" element={<IncidentReportPage authEnabled={authEnabled} />} />
          <Route path="/tools/case-notes" element={<CaseNotesPage authEnabled={authEnabled} />} />
          <Route path="/tools/ioc-checker" element={<IocPage authEnabled={authEnabled} />} />
          <Route path="/tools/jwt-decoder" element={<JwtPage authEnabled={authEnabled} />} />
          <Route path="/tools/awareness-quiz" element={<AwarenessQuizPage authEnabled={authEnabled} />} />
        </Routes>
      </Suspense>
    </SiteLayout>
  );
}
