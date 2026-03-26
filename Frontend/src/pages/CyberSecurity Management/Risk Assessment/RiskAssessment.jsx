import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Plus,
  Download,
  MessageSquare,
  Calendar,
  User,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Settings,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import riskMatrixService from "../../../services/riskMatrixService";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Load export libraries dynamically or ensure they are globally available
// import * as XLSX from "xlsx"; // Assuming loaded via script tag or similar
// import jsPDF from "jspdf"; // Assuming loaded via script tag or similar
// import "jspdf-autotable"; // Assuming loaded via script tag or similar

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
];

// --- ErrorDisplay Component (Defined Outside) ---
const ErrorDisplay = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onDismiss} className="p-1 rounded-full hover:bg-red-200">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

// --- Main Component ---
const CyberSecurityRiskAssessment = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskDetailsExpanded, setRiskDetailsExpanded] = useState(false);
  const [riskAnalysisExpanded, setRiskAnalysisExpanded] = useState(true);
  const [riskMatrixResults, setRiskMatrixResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // --- Add Risk Dialog State ---
  const [isAddRiskDialogOpen, setAddRiskDialogOpen] = useState(false);
  const [newRiskData, setNewRiskData] = useState({
    riskName: "",
    riskOwner: "",
    severity: 3, // Default to Medium
    justification: "",
    mitigation: "",
    projectId: "cybersecurity-risk-assessment", // Default specific to this page
  });
  // ---

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Items per page
    total: 0,
    pages: 0,
  });

  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [projects, setProjects] = useState([]);
  const [isProjectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [riskStats, setRiskStats] = useState({
    summary: {
      totalAssessments: 0,
      completedAssessments: 0,
      pendingAssessments: 0,
    },
  });
  const [pieData, setPieData] = useState([
    { name: "Critical", value: 0, color: "#ef4444" },
    { name: "High", value: 0, color: "#f97316" },
    { name: "Medium", value: 0, color: "#eab308" },
    { name: "Low", value: 0, color: "#22c55e" },
  ]);

  // --- Effects ---
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchRiskMatrixResults();
    fetchRiskStats();
    fetchProjects();
  }, []); // Initial fetch

  useEffect(() => {
    // Update Pie chart data when results change
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      setPieData([]);
      return;
    }
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    for (const risk of riskMatrixResults) {
      const level = Math.round(risk.severity || 0);
      if (level >= 5) counts.Critical += 1;
      else if (level >= 4) counts.High += 1;
      else if (level >= 3) counts.Medium += 1;
      else if (level >= 2) counts.Low += 1;
    }
    const pieDataArray = [
      { name: "Critical", value: counts.Critical, color: "#ef4444" },
      { name: "High", value: counts.High, color: "#f97316" },
      { name: "Medium", value: counts.Medium, color: "#eab308" },
      { name: "Low", value: counts.Low, color: "#22c55e" },
    ].filter((item) => item.value > 0);
    setPieData(pieDataArray);
  }, [riskMatrixResults]);

  const { recentProjects, allOtherProjects } = useMemo(() => {
    const recents = projects.slice(0, 4);
    const others = projects.slice(4);
    return { recentProjects: recents, allOtherProjects: others };
  }, [projects]);

  // --- Data Fetching ---
  const fetchRiskMatrixResults = async (params = {}) => {
    setError(null);
    setLoading(true);

    const pageToFetch = params.page ? params.page : 1;
    // Reset page to 1 if it's a filter/search action, not a pagination click
    if (!params.page) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      setPagination((prev) => ({ ...prev, page: params.page }));
    }

    try {
      const response = await riskMatrixService.getRisksBySystemType(
        "Cybersecurity",
        {
          page: pageToFetch,
          limit: pagination.limit,
          search: params.search !== undefined ? params.search : searchQuery,
          projectId:
            params.projectId !== undefined
              ? params.projectId
              : selectedProjectId,
          status: params.status !== undefined ? params.status : selectedStatus,
          sortBy: "createdAt",
          sortOrder: "desc",
        }
      );
      setRiskMatrixResults(response.risks || []);
      setPagination(
        response.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      );
    } catch (e) {
      console.error("Error fetching risks:", e);
      setError(e.message || "Failed to fetch cybersecurity risks.");
      setRiskMatrixResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      // --- THIS LINE IS CHANGED ---
      const response = await riskMatrixService.getRisksBySystemType(
        "Cybersecurity",
        { limit: 1000 }
      );
      // --- END OF CHANGE ---

      const uniqueProjects = [
        ...new Map(
          (response.risks || [])
            .filter((risk) => risk.projectId) // Ensure projectId exists
            .map((risk) => [
              risk.projectId,
              { id: risk.projectId, name: risk.projectId }, // Use id and name
            ])
        ).values(),
      ];
      setProjects(uniqueProjects);
    } catch (e) {
      console.error("Error fetching projects for filter:", e);
      // Handle project fetching error silently or show a specific message
    }
  };

  const fetchRiskStats = async () => {
    try {
      const stats = await riskMatrixService.getRiskStatistics(
        selectedProjectId === "all" ? null : selectedProjectId // Pass projectId if selected
      );
      setRiskStats(stats);
      const newPieData = [
        {
          name: "Critical",
          value: stats.riskLevels?.Critical || 0,
          color: "#ef4444",
        },
        { name: "High", value: stats.riskLevels?.High || 0, color: "#f97316" },
        {
          name: "Medium",
          value: stats.riskLevels?.Medium || 0,
          color: "#eab308",
        },
        { name: "Low", value: stats.riskLevels?.Low || 0, color: "#22c55e" },
      ].filter((item) => item.value > 0);
      setPieData(newPieData);
    } catch (e) {
      console.error("Error fetching risk statistics:", e);
      setError(e.message || "Failed to load statistics.");
    }
  };

  // --- Handlers ---
  const handleRiskClick = (risk) => {
    setError(null);
    setSelectedRisk(risk);
    setCurrentView("detail");
  };

  const handleBackToDashboard = () => {
    setError(null);
    setCurrentView("dashboard");
    setSelectedRisk(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchRiskMatrixResults({ search: query, page: 1 }); // Go to page 1 on new search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchRiskMatrixResults({ page: newPage }); // Fetch specific page
    }
  };

  const handleProjectFilterChange = (projectId) => {
    setSelectedProjectId(projectId);
    fetchRiskMatrixResults({ projectId: projectId, page: 1 }); // Go to page 1 on filter change
    fetchRiskStats(); // Update stats for the selected project
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    fetchRiskMatrixResults({ status: status, page: 1 }); // Go to page 1 on filter change
  };

  const handleStatusUpdate = async (risk, newStatus) => {
    setError(null);
    if (!risk.projectId) {
      const msg = `Cannot update risk "${risk.riskName}": Project ID is missing.`;
      setError(msg);
      console.error("Update failed: Project ID is missing for risk:", risk);
      return;
    }

    try {
      await riskMatrixService.updateRiskStatus(
        risk.riskAssessmentId,
        risk.projectId,
        newStatus
      );
      // Optimistically update UI
      setRiskMatrixResults((prevRisks) =>
        prevRisks.map((r) =>
          r._id === risk._id ? { ...r, status: newStatus } : r
        )
      );
      await fetchRiskStats(); // Refresh stats after update
    } catch (e) {
      console.error("Error updating risk status:", e);
      setError(e.message || "An unknown error occurred while updating status.");
      // Optionally revert UI change here if needed
    }
  };

  // Updated handleAddRisk to reset form and close dialog
  const handleAddRisk = async (data) => {
    setError(null);
    try {
      const projectId = data.projectId || "cybersecurity-risk-assessment"; // Use default if not provided
      await riskMatrixService.addRisk(projectId, data);

      // Reset form state
      setNewRiskData({
        riskName: "",
        riskOwner: "",
        severity: 3,
        justification: "",
        mitigation: "",
        projectId: "cybersecurity-risk-assessment",
      });
      setAddRiskDialogOpen(false); // Close dialog

      // Refresh data (fetch page 1 to see the new item)
      await fetchRiskMatrixResults({ page: 1 });
      await fetchRiskStats();
    } catch (e) {
      console.error("Error adding risk:", e);
      setError(e.message || "Failed to add risk.");
      // Keep dialog open on error? setAddRiskDialogOpen(true);
    }
  };

  // --- Export Handlers (assuming script loading logic exists) ---
  const ensureScriptsAreLoaded = () => {
    /* ... unchanged ... */
    return new Promise((resolve, reject) => {
      const scripts = {
        xlsx: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
        jspdf:
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        jspdfAutotable:
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js",
      };
      const loadScript = (id, url) =>
        new Promise((res, rej) => {
          // Check if script exists or if library is globally available
          if (
            document.getElementById(id) ||
            window[id.split("-")[0].toUpperCase().replace("LIB", "")]
          )
            return res();
          const script = document.createElement("script");
          script.id = id;
          script.src = url;
          script.async = true;
          script.onload = res;
          script.onerror = () =>
            rej(new Error(`Failed to load script: ${url}`));
          document.head.appendChild(script);
        });

      Promise.all([
        loadScript("xlsx-lib", scripts.xlsx),
        loadScript("jspdf-lib", scripts.jspdf),
      ])
        .then(() =>
          // Ensure jspdf.plugin is available after jspdf loads
          loadScript("jspdf-autotable-lib", scripts.jspdfAutotable).then(
            resolve
          )
        )
        .catch(reject);
    });
  };

  const handleExportExcel = async () => {
    /* ... unchanged ... */
    setIsExporting(true);
    setError(null);
    try {
      await ensureScriptsAreLoaded();
      if (!window.XLSX) throw new Error("XLSX library not loaded.");
      const XLSX = window.XLSX;

      const response = await riskMatrixService.getRisksBySystemType(
        "Cybersecurity",
        {
          // Fetch ALL relevant risks for export
          limit: pagination.total || 1000, // Fetch all if total is known, else a large number
          search: searchQuery,
          projectId: selectedProjectId,
          status: selectedStatus,
        }
      );
      const allRisks = response.risks || [];
      const dataToExport = allRisks.map((risk) => ({
        "Risk ID": risk.riskAssessmentId || risk._id,
        "Project ID": risk.projectId || "N/A",
        Name: risk.riskName,
        "Risk Level": `${getSeverityText(risk.severity)} (${risk.severity})`,
        Strategy: risk.status || "N/A",
        Owner: risk.createdBy?.name || risk.riskOwner || "N/A",
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cybersecurity Risks");
      XLSX.writeFile(workbook, "Cybersecurity_Risks_Export.xlsx");
    } catch (e) {
      console.error("Failed to export to Excel:", e);
      setError(e.message || "Failed to export to Excel.");
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportPDF = async () => {
    /* ... unchanged ... */
    setIsExporting(true);
    setError(null);
    try {
      await ensureScriptsAreLoaded();
      if (
        !window.jspdf ||
        !window.jspdf.jsPDF ||
        typeof window.jspdf.jsPDF.autoTable !== "function"
      ) {
        throw new Error(
          "jsPDF or jsPDF-AutoTable library not loaded correctly."
        );
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.text("Cybersecurity Risk Assessment Report", 14, 16);
      const response = await riskMatrixService.getRisksBySystemType(
        "Cybersecurity",
        {
          // Fetch ALL relevant risks for export
          limit: pagination.total || 1000,
          search: searchQuery,
          projectId: selectedProjectId,
          status: selectedStatus,
        }
      );
      const allRisks = response.risks || [];
      const tableColumn = ["Risk ID", "Name", "Level", "Strategy", "Owner"];
      const tableRows = allRisks.map((risk) => [
        risk.riskAssessmentId || risk._id,
        risk.riskName,
        `${getSeverityText(risk.severity)} (${risk.severity})`,
        risk.status || "N/A",
        risk.createdBy?.name || risk.riskOwner || "N/A",
      ]);
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("Cybersecurity_Risks_Export.pdf");
    } catch (e) {
      console.error("Error exporting to PDF:", e);
      setError(e.message || "Failed to export to PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- Utility Functions ---
  const getSeverityText = (severity) => {
    /* ... unchanged ... */
    const level = Math.round(severity);
    if (level >= 5) return "Critical";
    if (level >= 4) return "High";
    if (level >= 3) return "Medium";
    if (level >= 2) return "Low";
    return "Very Low";
  };
  const calculateStrategyProgress = () => {
    /* ... unchanged ... */
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      return { completed: 0, pending: 0, rejected: 0, total: 0 };
    }
    const strategyCounts = { completed: 0, pending: 0, rejected: 0 };
    riskMatrixResults.forEach((risk) => {
      const status = risk.status;
      if (status === "Completed") strategyCounts.completed += 1;
      else if (status === "Pending") strategyCounts.pending += 1;
      else if (status === "Rejected") strategyCounts.rejected += 1;
    });
    const total = riskMatrixResults.length;
    return { ...strategyCounts, total };
  };
  const calculateHeatmapData = () => {
    /* ... unchanged ... */
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      return Array.from({ length: 25 }, () => ({ intensity: 0, riskCount: 0 }));
    }
    const grid = Array.from({ length: 25 }, () => ({
      intensity: 0,
      riskCount: 0,
    }));
    riskMatrixResults.forEach((risk) => {
      const severity = Math.round(risk.severity || 0);
      let impact = 1,
        probability = 1;
      if (severity >= 5) {
        impact = 5;
        probability = 5;
      } else if (severity >= 4) {
        impact = 4;
        probability = 4;
      } else if (severity >= 3) {
        impact = 3;
        probability = 3;
      } else if (severity >= 2) {
        impact = 2;
        probability = 2;
      }
      const gridIndex = (probability - 1) * 5 + (impact - 1);
      if (gridIndex >= 0 && gridIndex < 25) {
        grid[gridIndex].riskCount += 1;
        grid[gridIndex].intensity = Math.min(
          grid[gridIndex].riskCount /
            Math.max(1, riskMatrixResults.length / 10),
          1
        );
      }
    });
    return grid;
  };

  // --- Render Logic ---

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Cybersecurity Risk Manager
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddRiskDialogOpen(true)} // Open dialog
          >
            <Plus className="w-4 h-4 mr-2" />
            Add risk
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export risks"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleExportExcel}>
                Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportPDF}>
                Export as PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Project Filter Combobox */}
          <Popover
            open={isProjectPopoverOpen}
            onOpenChange={setProjectPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isProjectPopoverOpen}
                className="w-[200px] justify-between"
              >
                {selectedProjectId === "all"
                  ? "Select a Project"
                  : projects.find((p) => p.id === selectedProjectId)?.name ||
                    "Select a Project"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandList>
                  <CommandEmpty>No project found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        handleProjectFilterChange("all");
                        setProjectPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProjectId === "all"
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />{" "}
                      All Projects
                    </CommandItem>
                  </CommandGroup>
                  {recentProjects.length > 0 && (
                    <>
                      {" "}
                      <CommandSeparator />{" "}
                      <CommandGroup heading="Recent Projects">
                        {" "}
                        {recentProjects.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              handleProjectFilterChange(p.id);
                              setProjectPopoverOpen(false);
                            }}
                          >
                            {" "}
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProjectId === p.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />{" "}
                            {p.name}{" "}
                          </CommandItem>
                        ))}{" "}
                      </CommandGroup>{" "}
                    </>
                  )}
                  {allOtherProjects.length > 0 && (
                    <>
                      {" "}
                      <CommandSeparator />{" "}
                      <CommandGroup heading="All Projects">
                        {" "}
                        {allOtherProjects.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              handleProjectFilterChange(p.id);
                              setProjectPopoverOpen(false);
                            }}
                          >
                            {" "}
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProjectId === p.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />{" "}
                            {p.name}{" "}
                          </CommandItem>
                        ))}{" "}
                      </CommandGroup>{" "}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status Filter Select */}
          <Select
            value={selectedStatus}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {" "}
                  {opt.label}{" "}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Strategy Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const p = calculateStrategyProgress();
                return (
                  <>
                    {" "}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Completed</span>
                        <span className="text-sm font-medium">
                          {p.completed} risks
                        </span>
                      </div>
                      <Progress
                        value={p.total > 0 ? (p.completed / p.total) * 100 : 0}
                        className="h-3"
                      />
                    </div>{" "}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Pending</span>
                        <span className="text-sm font-medium">
                          {p.pending} risks
                        </span>
                      </div>
                      <Progress
                        value={p.total > 0 ? (p.pending / p.total) * 100 : 0}
                        className="h-3"
                      />
                    </div>{" "}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Rejected</span>
                        <span className="text-sm font-medium">
                          {p.rejected} risks
                        </span>
                      </div>
                      <Progress
                        value={p.total > 0 ? (p.rejected / p.total) * 100 : 0}
                        className="h-3"
                      />
                    </div>{" "}
                  </>
                );
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Heat Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Impact (X) vs Probability (Y)
                </div>
                <div className="grid grid-cols-5 gap-1 h-32">
                  {(() => {
                    const d = calculateHeatmapData();
                    return d.map((c, i) => {
                      let b = "bg-gray-100";
                      if (c.riskCount > 0) {
                        if (c.intensity <= 0.3) b = "bg-yellow-200";
                        else if (c.intensity <= 0.6) b = "bg-orange-300";
                        else if (c.intensity <= 0.8) b = "bg-red-400";
                        else b = "bg-red-600";
                      }
                      return (
                        <div
                          key={i}
                          className={`${b} rounded-sm relative group cursor-pointer flex items-center justify-center`}
                          title={`Impact: ${(i % 5) + 1}, Prob: ${
                            Math.floor(i / 5) + 1
                          }, Risks: ${c.riskCount}`}
                        >
                          {c.riskCount > 0 && (
                            <span className="text-xs font-medium text-white mix-blend-difference">
                              {c.riskCount}
                            </span>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Impact</span>
                  <span>High Impact</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ErrorDisplay message={error} onDismiss={() => setError(null)} />

        {/* Risk Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Risk level</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Controls</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading risks...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : riskMatrixResults.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No risks found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  riskMatrixResults.map((item) => (
                    <TableRow key={item._id}>
                      {" "}
                      <TableCell
                        className="font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleRiskClick(item)}
                      >
                        {item.riskAssessmentId || item._id}
                      </TableCell>{" "}
                      <TableCell>{item.projectId || "N/A"}</TableCell>{" "}
                      <TableCell>{item.riskName}</TableCell>{" "}
                      <TableCell>
                        {" "}
                        <Badge
                          variant="secondary"
                          className={
                            item.severity >= 5
                              ? "bg-red-100 text-red-800"
                              : item.severity >= 4
                              ? "bg-orange-100 text-orange-800"
                              : item.severity >= 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {" "}
                          {getSeverityText(item.severity)} ({item.severity}){" "}
                        </Badge>{" "}
                      </TableCell>{" "}
                      <TableCell>{item.status || "Not Set"}</TableCell>{" "}
                      <TableCell>{item.controlCount || 0}</TableCell>{" "}
                      <TableCell>
                        {" "}
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {item.riskOwner?.charAt(0) ||
                              item.createdBy?.name?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>{" "}
                      </TableCell>{" "}
                      <TableCell className="text-right">
                        {" "}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <span className="sr-only">Open menu</span>•••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() =>
                                handleStatusUpdate(item, "Completed")
                              }
                            >
                              Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleStatusUpdate(item, "Pending")
                              }
                            >
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleStatusUpdate(item, "Rejected")
                              }
                            >
                              Rejected
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>{" "}
                      </TableCell>{" "}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} risks
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {" "}
                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      let pN;
                      if (pagination.pages <= 5) pN = i + 1;
                      else if (pagination.page <= 3) pN = i + 1;
                      else if (pagination.page >= pagination.pages - 2)
                        pN = pagination.pages - 4 + i;
                      else pN = pagination.page - 2 + i;
                      return (
                        <Button
                          key={pN}
                          variant={
                            pN === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pN)}
                          className="w-8 h-8 p-0"
                        >
                          {pN}
                        </Button>
                      );
                    }
                  )}{" "}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* --- Add Risk Dialog --- */}
      <Dialog open={isAddRiskDialogOpen} onOpenChange={setAddRiskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Cybersecurity Risk</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskName-add" className="text-right">
                Name
              </label>
              <Input
                id="riskName-add"
                value={newRiskData.riskName}
                onChange={(e) =>
                  setNewRiskData({ ...newRiskData, riskName: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskOwner-add" className="text-right">
                Owner
              </label>
              <Input
                id="riskOwner-add"
                value={newRiskData.riskOwner}
                onChange={(e) =>
                  setNewRiskData({ ...newRiskData, riskOwner: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="severity-add" className="text-right">
                Severity
              </label>
              <Select
                value={String(newRiskData.severity)}
                onValueChange={(value) =>
                  setNewRiskData({ ...newRiskData, severity: parseInt(value) })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Critical</SelectItem>
                  <SelectItem value="4">High</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="2">Low</SelectItem>
                  <SelectItem value="1">Very Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* TODO: Add Textarea for justification/mitigation here */}
          </div>
          <Button
            onClick={() => {
              if (!newRiskData.riskName || !newRiskData.riskOwner) {
                alert("Risk Name and Owner are required.");
                return;
              }
              handleAddRisk(newRiskData);
            }}
          >
            Create Risk
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );

  const DetailView = () => (
    <div className="space-y-6">
      {/* ... (DetailView JSX remains unchanged) ... */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all risks
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {selectedRisk?.riskAssessmentId}
            </h1>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {getSeverityText(selectedRisk?.severity)} (
              {selectedRisk?.severity})
            </Badge>
            <Badge variant="outline">{selectedRisk?.status}</Badge>
          </div>
          <h2 className="text-xl text-muted-foreground mt-1">
            {selectedRisk?.riskName}
          </h2>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Link control
        </Button>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add document
        </Button>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Comments
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Tasks
        </Button>
        <Button variant="outline" size="sm">
          Activity log
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm">Residual risk automation</span>
          <Switch />
        </div>
      </div>
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setRiskDetailsExpanded(!riskDetailsExpanded)}
        >
          <CardTitle className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                riskDetailsExpanded ? "rotate-180" : ""
              }`}
            />
            Risk details
          </CardTitle>
        </CardHeader>
        {riskDetailsExpanded && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Justification: {selectedRisk?.justification || "N/A"}
              <br />
              Mitigation: {selectedRisk?.mitigation || "N/A"}
              <br />
              Created By:{" "}
              {selectedRisk?.createdBy?.name ||
                selectedRisk?.riskOwner ||
                "N/A"}
              <br />
              Created At:{" "}
              {selectedRisk?.createdAt
                ? new Date(selectedRisk.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setRiskAnalysisExpanded(!riskAnalysisExpanded)}
        >
          <CardTitle className="flex items-center gap-2">
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                riskAnalysisExpanded ? "rotate-180" : ""
              }`}
            />
            Risk analysis
          </CardTitle>
        </CardHeader>
        {riskAnalysisExpanded && (
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Inherent risk</h4>
              <div className="flex justify-around gap-4 items-center">
                <div>
                  <span className="text-sm text-muted-foreground">Impact</span>
                  <Badge className="bg-pink-500 text-white ml-2">
                    Major (4)
                  </Badge>
                </div>
                <div className="text-center">×</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Likelihood
                  </span>
                  <Badge className="bg-orange-500 text-white ml-2">
                    Possible (3)
                  </Badge>
                </div>
                <div className="text-center">=</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Risk level
                  </span>
                  <Badge className="bg-orange-500 text-white ml-2">
                    {getSeverityText(selectedRisk?.severity)} (
                    {selectedRisk?.severity || "N/A"})
                  </Badge>
                </div>
                <div></div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Financial impact
                  </span>
                  <div className="text-sm mt-1">
                    {selectedRisk?.financialImpact || "Not set"}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Residual risk</h4>
              <div className="flex justify-around gap-4 items-center">
                <div>
                  <span className="text-sm text-muted-foreground">Impact</span>
                  <Badge className="bg-yellow-500 text-white ml-2">
                    Moderate (3)
                  </Badge>
                </div>
                <div className="text-center">×</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Likelihood
                  </span>
                  <Badge className="bg-yellow-500 text-white ml-2">
                    Unlikely (2)
                  </Badge>
                </div>
                <div className="text-center">=</div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Risk level
                  </span>
                  <Badge className="bg-yellow-500 text-white ml-2">
                    {getSeverityText(selectedRisk?.residualScore)} (
                    {selectedRisk?.residualScore || "N/A"})
                  </Badge>
                </div>
                <div></div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Financial impact
                  </span>
                  <div className="text-sm mt-1">
                    {selectedRisk?.residualFinancialImpact || "Not set"}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Target risk level
              </span>
              <Badge className="bg-teal-500 text-white ml-2">
                {getSeverityText(selectedRisk?.targetScore)} (
                {selectedRisk?.targetScore || "N/A"})
              </Badge>
            </div>
            <div className="text-right">
              <Button variant="link" className="text-blue-600">
                How is the Risk level calculated?
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Treatment plan</span>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add plan
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Treatment plan details will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex-1">
      <main className="p-6">
        {currentView === "dashboard" ? <DashboardView /> : <DetailView />}
      </main>
    </div>
  );
};

export default CyberSecurityRiskAssessment;
