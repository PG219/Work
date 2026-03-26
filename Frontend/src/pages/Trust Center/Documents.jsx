import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrustCenterChatbot from "@/components/trustCentreBot";
import {
  FileText,
  Download,
  Search,
  Calendar,
  Eye,
  Lock,
  Globe,
  Shield,
  Users,
  Gavel,
  X,
} from "lucide-react";
import { BACKEND_URL } from "@/config/env"; // ✅ centralized env handling
import trustCenterRAGService from "../../services/trustCenterRAGService";

// ============================================================================
// DOCUMENT VIEWER COMPONENT
// ============================================================================
const DocumentViewer = ({ url, onClose }) => {
  if (!url) return null;

  const isImage = url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/);
  const isPdf = url.toLowerCase().includes(".pdf");
  const isOfficeDoc = !isImage && !isPdf;

  const viewerUrl = isOfficeDoc
    ? `https://docs.google.com/gview?url=${encodeURIComponent(
        url
      )}&embedded=true`
    : url;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl h-[95%] w-[90%] max-w-6xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-2 border-b">
          <span className="text-sm text-muted-foreground truncate px-2">
            {url}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 p-2">
          {isImage ? (
            <img
              src={url}
              alt="Document Preview"
              className="max-w-full max-h-full object-contain mx-auto"
            />
          ) : (
            <iframe
              src={viewerUrl}
              width="100%"
              height="100%"
              title="Document Viewer"
              frameBorder="0"
              className="rounded-b-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const TrustCenterDocuments = () => {
  // --- STATE MANAGEMENT ---
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [auditReports, setAuditReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingUrl, setViewingUrl] = useState("");
  const [syncStatus, setSyncStatus] = useState({
    indexed_file_count: 0,
    sync_running: false,
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await trustCenterRAGService.getDocuments();

        // Defensive filter on frontend: only keep .pdf files (avoids folders/others)
        const onlyPdfs = (arr) =>
          (arr || []).filter(
            (d) =>
              typeof d?.fileName === "string" &&
              d.fileName.toLowerCase().endsWith(".pdf")
          );

        setPolicyDocuments(onlyPdfs(data.policies));
        setCertifications(onlyPdfs(data.certifications));
        setAuditReports(onlyPdfs(data.audits));
      } catch (e) {
        console.error("Failed to fetch documents:", e);
        setError(
          "Could not load documents. Please ensure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // --- SYNC STATUS FETCHING ---
  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const status = await trustCenterRAGService.getSyncStatusViaBackend();
        setSyncStatus(status);
      } catch (error) {
        console.error("Failed to fetch sync status:", error);
      }
    };

    fetchSyncStatus();
    // Refresh sync status every 2 minutes
    const interval = setInterval(fetchSyncStatus, 120000);
    return () => clearInterval(interval);
  }, []);

  // --- CLICK HANDLERS ---
  const handleViewDocument = async (fileName) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/documents/url/${encodeURIComponent(fileName)}`
      );
      if (!response.ok) throw new Error("Could not retrieve the document URL.");
      const { url } = await response.json();
      setViewingUrl(url);
      setIsViewerOpen(true);
    } catch (err) {
      console.error("Error opening document:", err);
      alert("Sorry, the document could not be opened at this time.");
    }
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setViewingUrl("");
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await trustCenterRAGService.syncDocumentsViaBackend();
      console.log("Manual sync completed:", result);
      // Refresh sync status
      const status = await trustCenterRAGService.getSyncStatusViaBackend();
      setSyncStatus(status);
    } catch (error) {
      console.error("Manual sync failed:", error);
      alert("Sync failed: " + error.message);
    } finally {
      setSyncing(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const getBaseName = (name) => {
    if (!name || typeof name !== "string") return "";
    try {
      return name.split("/").pop();
    } catch {
      return name;
    }
  };

  const getAccessIcon = (access) => {
    switch (access) {
      case "Public":
        return <Globe className="w-4 h-4 text-green-500" />;
      case "Business":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "Internal":
        return <Shield className="w-4 h-4 text-orange-500" />;
      case "Confidential":
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Privacy":
        return "bg-blue-500";
      case "Security":
        return "bg-red-500";
      case "Legal":
        return "bg-purple-500";
      case "Compliance":
        return "bg-green-500";
      case "Risk":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // --- CONDITIONAL RENDERING ---
  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading documents...
      </div>
    );
  }
  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex-1">
      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Trust Center Documents</h1>
            <p className="text-muted-foreground">
              Access policies, certifications, and compliance documentation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search documents..." className="pl-10 w-64" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Sync Documents
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {policyDocuments.length +
                  certifications.length +
                  auditReports.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total documents available
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Public Documents
              </CardTitle>
              <Globe className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  [
                    ...policyDocuments,
                    ...certifications,
                    ...auditReports,
                  ].filter((d) => d.access === "Public").length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Available to all users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certifications
              </CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certifications.length}</div>
              <p className="text-xs text-muted-foreground">
                Active certifications
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Indexed Files
              </CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {syncStatus.indexed_file_count}
              </div>
              <p className="text-xs text-muted-foreground">
                {syncStatus.sync_running
                  ? "Auto-sync active"
                  : "Auto-sync paused"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="policies" className="space-y-4">
          <TabsList className="bg-gradient-to-r from-card via-card/80 to-card p-2 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
            {policyDocuments.length > 0 && (
              <TabsTrigger
                value="policies"
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Policies & Agreements
              </TabsTrigger>
            )}
            {certifications.length > 0 && (
              <TabsTrigger
                value="certifications"
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Certifications
              </TabsTrigger>
            )}
            {auditReports.length > 0 && (
              <TabsTrigger
                value="audits"
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Audit Reports
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policies & Legal Agreements</CardTitle>
                <CardDescription>
                  Official policies, terms of service, and legal documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {policyDocuments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No PDF documents available.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policyDocuments.map((doc) => (
                      <div
                        key={doc.fileName}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <FileText className="w-8 h-8 text-muted-foreground mt-1" />
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">
                                {getBaseName(doc.fileName)}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={`text-white ${getCategoryColor(
                                  doc.category
                                )}`}
                              >
                                {doc.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getAccessIcon(doc.access)}
                                <span className="text-xs text-muted-foreground">
                                  {doc.access}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {doc.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Updated {doc.lastUpdated}
                              </span>
                              <span>{doc.version}</span>
                              <span>{doc.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(doc.fileName)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(doc.fileName)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance Certifications</CardTitle>
                <CardDescription>
                  Third-party certifications and compliance attestations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {certifications.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No PDF documents available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certifications.map((cert) => (
                      <div
                        key={cert.fileName}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-8 h-8 text-blue-500" />
                          <div>
                            <h3 className="font-semibold">
                              {getBaseName(cert.fileName)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Issued by {cert.issuer}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cert.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Valid until:</span>
                            <span className="font-medium">
                              {cert.validUntil}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Category:</span>
                            <Badge
                              variant="secondary"
                              className={`text-white ${getCategoryColor(
                                cert.category
                              )}`}
                            >
                              {cert.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDocument(cert.fileName)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewDocument(cert.fileName)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Reports & Assessments</CardTitle>
                <CardDescription>
                  Internal and external audit findings and compliance reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditReports.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No PDF documents available.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditReports.map((report) => (
                      <div
                        key={report.fileName}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <Gavel className="w-8 h-8 text-orange-500 mt-1" />
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">
                                {getBaseName(report.fileName)}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={`text-white ${getCategoryColor(
                                  report.category
                                )}`}
                              >
                                {report.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getAccessIcon(report.access)}
                                <span className="text-xs text-muted-foreground">
                                  {report.access}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {report.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Auditor: {report.auditor}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {report.date}
                              </span>
                              <span>{report.size}</span>
                              <span className="text-orange-600">
                                {report.findings}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(report.fileName)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Summary
                          </Button>
                          {report.access !== "Confidential" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewDocument(report.fileName)
                              }
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      {isViewerOpen && (
        <DocumentViewer url={viewingUrl} onClose={closeViewer} />
      )}
      <TrustCenterChatbot />
    </div>
  );
};

export default TrustCenterDocuments;
