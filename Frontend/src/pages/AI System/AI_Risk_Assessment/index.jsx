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

// 1. Import Combobox components
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

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
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
  Settings,
  X as XIcon,
  ChevronsUpDown, // 1. Import new icons
  Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react"; // 1. Import useMemo
import riskMatrixService from "../../../services/riskMatrixService";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import { clsx } from "clsx"; // 1. Import clsx and twMerge for cn
import { twMerge } from "tailwind-merge";

// 1. Add cn function
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
];

const AIRiskAssessment = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskDetailsExpanded, setRiskDetailsExpanded] = useState(false);
  const [riskAnalysisExpanded, setRiskAnalysisExpanded] = useState(true);
  const [riskMatrixResults, setRiskMatrixResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State for the Add Risk Dialog
  const [isAddRiskDialogOpen, setAddRiskDialogOpen] = useState(false);
  const [newRiskData, setNewRiskData] = useState({
    riskName: "",
    riskOwner: "",
    severity: 3, // Default to Medium
    justification: "",
    mitigation: "",
    projectId: "ai-risk-assessment", // You can even make this selectable
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Changed from 20 to 10
    total: 0,
    pages: 0,
  });

  const [error, setError] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [projects, setProjects] = useState([]);

  // 2. Add state for the Combobox popover
  const [isProjectPopoverOpen, setProjectPopoverOpen] = useState(false);

  const [barChartData, setBarChartData] = useState([]);

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

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const fetchProjects = async () => {
    try {
      const response = await riskMatrixService.getRisksBySystemType("AI", {
        limit: 1000,
      });
      const allRisks = response.risks || [];
      const uniqueProjects = [
        ...new Map(
          allRisks
            .filter((risk) => risk.projectId)
            .map((risk) => [
              risk.projectId,
              // Use 'id' and 'name' for consistency
              { id: risk.projectId, name: risk.projectId },
            ])
        ).values(),
      ];
      setProjects(uniqueProjects);
    } catch (e) {
      console.error("Error fetching projects:", e);
    }
  };

  // --- THE DIALOG WAS HERE, IT HAS BEEN MOVED ---

  const fetchRiskMatrixResults = async (params = {}) => {
    setError(null);
    setLoading(true);

    const newPage = params.page || 1;
    const newSearch = params.search !== undefined ? params.search : searchQuery;
    const newProjectId =
      params.projectId !== undefined ? params.projectId : selectedProjectId;
    const newStatus =
      params.status !== undefined ? params.status : selectedStatus;

    const pageToFetch = params.page ? newPage : 1;

    if (params.page) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    } else {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    try {
      const queryParams = {
        page: pageToFetch,
        limit: pagination.limit, // This will now use 10 from the state
        search: newSearch,
        projectId: newProjectId,
        status: newStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await riskMatrixService.getRisksBySystemType(
        "AI",
        queryParams
      );
      setRiskMatrixResults(response.risks || []);

      // --- ALSO UPDATED THE FALLBACK HERE ---
      setPagination(
        response.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      );
    } catch (e) {
      console.error("Error fetching risks:", e);
      setError(e.message || "Failed to fetch risks.");
      setRiskMatrixResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskStats = async () => {
    try {
      const stats = await riskMatrixService.getRiskStatistics(
        selectedProjectId === "all" ? null : selectedProjectId
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

  useEffect(() => {
    fetchRiskMatrixResults();
    fetchRiskStats();
    fetchProjects();
  }, []);

  // ... (useEffect for pieData remains the same) ...
  useEffect(() => {
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      setPieData([]); // Clear pie data if no results
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

    // Filter out risk levels with 0 values
    const pieDataArray = [
      { name: "Critical", value: counts.Critical, color: "#ef4444" },
      { name: "High", value: counts.High, color: "#f97316" },
      { name: "Medium", value: counts.Medium, color: "#eab308" },
      { name: "Low", value: counts.Low, color: "#22c55e" },
    ].filter((item) => item.value > 0);

    setPieData(pieDataArray);
  }, [riskMatrixResults]);

  // ... (calculateStrategyProgress and calculateHeatmapData remain the same) ...
  const calculateStrategyProgress = () => {
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      return { completed: 0, pending: 0, rejected: 0, total: 0 };
    }

    const strategyCounts = { completed: 0, pending: 0, rejected: 0 };

    riskMatrixResults.forEach((risk) => {
      const status = risk.status;
      // Count risks by their current status
      if (status === "Completed") {
        strategyCounts.completed += 1;
      } else if (status === "Pending") {
        strategyCounts.pending += 1;
      } else if (status === "Rejected") {
        strategyCounts.rejected += 1;
      }
    });

    const total = riskMatrixResults.length;
    return { ...strategyCounts, total };
  };

  const calculateHeatmapData = () => {
    if (!riskMatrixResults || riskMatrixResults.length === 0) {
      return Array.from({ length: 25 }, () => ({ intensity: 0, riskCount: 0 }));
    }

    // Create a 5x5 grid representing different risk combinations
    // X-axis: Impact (1-5), Y-axis: Probability (1-5)
    const grid = Array.from({ length: 25 }, () => ({
      intensity: 0,
      riskCount: 0,
    }));

    riskMatrixResults.forEach((risk) => {
      // Map severity to impact and probability
      const severity = Math.round(risk.severity || 0);
      let impact, probability;

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
      } else {
        impact = 1;
        probability = 1;
      }

      // Calculate grid index (0-24)
      const gridIndex = (probability - 1) * 5 + (impact - 1);

      if (gridIndex >= 0 && gridIndex < 25) {
        grid[gridIndex].riskCount += 1;
        // Calculate intensity based on risk count (normalized)
        grid[gridIndex].intensity = Math.min(
          grid[gridIndex].riskCount /
            Math.max(1, riskMatrixResults.length / 10),
          1
        );
      }
    });

    return grid;
  };

  // ... (useEffect for barChartData remains the same) ...
  useEffect(() => {
    if (riskMatrixResults.length > 0) {
      const aggregatedData = riskMatrixResults.reduce((acc, risk) => {
        const key = risk.projectId || "Unassigned";
        if (!acc[key]) {
          acc[key] = { name: key, inherent: [], residual: [], target: [] };
        }
        acc[key].inherent.push(risk.severity);
        acc[key].residual.push(risk.residualScore || 0);
        acc[key].target.push(risk.targetScore || 0);
        return acc;
      }, {});
      const chartData = Object.values(aggregatedData).map((project) => {
        const avg = (arr) =>
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        return {
          name: project.name,
          inherent: avg(project.inherent),
          residual: avg(project.residual),
          target: avg(project.target),
        };
      });
      setBarChartData(chartData);
    } else {
      setBarChartData([]); // Clear chart data if no risks
    }
  }, [riskMatrixResults]);

  // 3. Create derived lists for recent and all other projects
  const { recentProjects, allOtherProjects } = useMemo(() => {
    const recents = projects.slice(0, 4);
    const others = projects.slice(4);
    return { recentProjects: recents, allOtherProjects: others };
  }, [projects]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchRiskMatrixResults({ search: query });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchRiskMatrixResults({ page: newPage });
    }
  };

  const handleProjectFilterChange = (projectId) => {
    setSelectedProjectId(projectId);
    fetchRiskMatrixResults({ projectId: projectId });
    fetchRiskStats();
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    fetchRiskMatrixResults({ status: status });
  };

  // ... (handleStatusUpdate, handleAddRisk, getSeverityText, handleExportExcel, handleExportPDF remain the same) ...
  const handleStatusUpdate = async (risk, newStatus) => {
    setError(null);
    // Validation: Ensure projectId exists before attempting the update.
    if (!risk.projectId) {
      setError(`Cannot update risk "${risk.riskName}": Project ID is missing.`);
      console.error("Update failed: Project ID is missing for risk:", risk);
      return;
    }

    try {
      await riskMatrixService.updateRiskStatus(
        risk.riskAssessmentId,
        risk.projectId,
        newStatus
      );
      // Optimistically update the UI to feel faster
      setRiskMatrixResults((prevRisks) =>
        prevRisks.map((r) =>
          r._id === risk._id ? { ...r, status: newStatus } : r
        )
      );
      // Fetch stats again to keep charts in sync
      await fetchRiskStats();
    } catch (e) {
      console.error("Error updating risk status:", e);
      setError(e.message || "An unknown error occurred while updating status.");
    }
  };

  const handleAddRisk = async (riskData) => {
    setError(null);
    try {
      // Use the projectId from the state, or a default
      const projectId = riskData.projectId || "ai-risk-assessment";
      await riskMatrixService.addRisk(projectId, riskData);

      // Reset the form and close dialog
      setNewRiskData({
        riskName: "",
        riskOwner: "",
        severity: 3,
        justification: "",
        mitigation: "",
        projectId: "ai-risk-assessment",
      });
      setAddRiskDialogOpen(false);

      // Refresh data
      await fetchRiskMatrixResults();
      await fetchRiskStats();
    } catch (e) {
      console.error("Error adding risk:", e);
      setError(e.message || "Failed to add risk.");
    }
  };

  const getSeverityText = (severity) => {
    const level = Math.round(severity);
    if (level >= 5) return "Critical";
    if (level >= 4) return "High";
    if (level >= 3) return "Medium";
    if (level >= 2) return "Low";
    return "Very Low";
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await riskMatrixService.getRisksBySystemType("AI", {
        limit: pagination.total || 1000,
        projectId: selectedProjectId,
        status: selectedStatus,
        search: searchQuery,
      });
      const allRisks = response.risks || [];
      const dataToExport = allRisks.map((risk) => ({
        "Risk ID": risk.riskAssessmentId,
        "Project ID": risk.projectId || "N/A",
        Name: risk.riskName,
        "Risk Level": `${getSeverityText(risk.severity)} (${risk.severity})`,
        Strategy: risk.status || "N/A",
        "Risk Owner": risk.createdBy?.name || risk.riskOwner || "N/A",
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AI Risks");
      XLSX.writeFile(workbook, "AI_Risks_Export.xlsx");
    } catch (e) {
      console.error("Error exporting to Excel:", e);
      setError(e.message || "Failed to export to Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await riskMatrixService.getRisksBySystemType("AI", {
        limit: pagination.total || 1000,
        projectId: selectedProjectId,
        status: selectedStatus,
        search: searchQuery,
      });
      const allRisks = response.risks || [];
      const doc = new jsPDF();
      doc.text("AI Risk Assessment Report", 14, 16);
      const tableColumn = ["Risk ID", "Name", "Level", "Strategy", "Owner"];
      const tableRows = [];
      allRisks.forEach((risk) => {
        const riskData = [
          risk.riskAssessmentId,
          risk.riskName,
          `${getSeverityText(risk.severity)} (${risk.severity})`,
          risk.status || "N/A",
          risk.createdBy?.name || risk.riskOwner || "N/A",
        ];
        tableRows.push(riskData);
      });
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("AI_Risks_Export.pdf");
    } catch (e) {
      console.error("Error exporting to PDF:", e);
      setError(e.message || "Failed to export to PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // ... (ErrorDisplay component remains the same) ...
  const ErrorDisplay = ({ message, onDismiss }) => {
    if (!message) return null;
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4 flex justify-between items-center">
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full hover:bg-red-200"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">AI Risk Manager</h1>
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
        <div className="flex flex-wrap gap-4 mb-6">
          {/* --- THIS BUTTON IS NOW FIXED --- */}
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddRiskDialogOpen(true)}
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

          {/* 4. REPLACE the old project <Select> with this new <Popover> Combobox */}
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
                      />
                      All Projects
                    </CommandItem>
                  </CommandGroup>

                  {/* Recent Projects Section */}
                  {recentProjects.length > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup heading="Recent Projects">
                        {recentProjects.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              handleProjectFilterChange(p.id);
                              setProjectPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProjectId === p.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {p.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}

                  {/* All Other Projects Section */}
                  {allOtherProjects.length > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup heading="All Projects">
                        {allOtherProjects.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => {
                              handleProjectFilterChange(p.id);
                              setProjectPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProjectId === p.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {p.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status Filter (remains a Select) */}
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
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ... (Rest of DashboardView: charts, error display, table, pagination) ... */}
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
                const strategyProgress = calculateStrategyProgress();
                return (
                  <>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Completed</span>
                        <span className="text-sm font-medium">
                          {strategyProgress.completed} risks
                        </span>
                      </div>
                      <Progress
                        value={
                          strategyProgress.total > 0
                            ? (strategyProgress.completed /
                                strategyProgress.total) *
                              100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Pending</span>
                        <span className="text-sm font-medium">
                          {strategyProgress.pending} risks
                        </span>
                      </div>
                      <Progress
                        value={
                          strategyProgress.total > 0
                            ? (strategyProgress.pending /
                                strategyProgress.total) *
                              100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Rejected</span>
                        <span className="text-sm font-medium">
                          {strategyProgress.rejected} risks
                        </span>
                      </div>
                      <Progress
                        value={
                          strategyProgress.total > 0
                            ? (strategyProgress.rejected /
                                strategyProgress.total) *
                              100
                            : 0
                        }
                        className="h-3"
                      />
                    </div>
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
                  Impact (X) vs Probability (Y) - Color intensity shows risk
                  concentration
                </div>
                <div className="grid grid-cols-5 gap-1 h-24">
                  {(() => {
                    const heatmapData = calculateHeatmapData();
                    return heatmapData.map((cell, i) => {
                      let bgColor = "bg-gray-100";
                      if (cell.riskCount > 0) {
                        if (cell.intensity <= 0.3) bgColor = "bg-yellow-200";
                        else if (cell.intensity <= 0.6)
                          bgColor = "bg-orange-300";
                        else if (cell.intensity <= 0.8) bgColor = "bg-red-400";
                        else bgColor = "bg-red-600";
                      }

                      return (
                        <div
                          key={i}
                          className={`${bgColor} rounded-sm relative group cursor-pointer`}
                          title={`Impact: ${(i % 5) + 1}, Probability: ${
                            Math.floor(i / 5) + 1
                          }, Risks: ${cell.riskCount}`}
                        >
                          {cell.riskCount > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                              {cell.riskCount}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ErrorDisplay message={error} onDismiss={() => setError(null)} />

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>PROJECT ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Risk level</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Controls</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
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
                      <TableCell
                        className="font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleRiskClick(item)}
                      >
                        {item.riskAssessmentId}
                      </TableCell>
                      <TableCell>{item.projectId || "Not set"}</TableCell>
                      <TableCell>{item.riskName}</TableCell>
                      <TableCell>
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
                          {getSeverityText(item.severity)} ({item.severity})
                        </Badge>
                      </TableCell>
                      <TableCell>{item.status || "Not Set"}</TableCell>
                      <TableCell>{item.controlCount || 0}</TableCell>
                      <TableCell>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {item.createdBy?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-right">
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
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

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
                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
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

      {/* --- 
        THE DIALOG IS NOW HERE, inside DashboardView's return. 
        This is the correct place.
      --- */}
      <Dialog open={isAddRiskDialogOpen} onOpenChange={setAddRiskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Risk</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Risk Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskName" className="text-right">
                Name
              </label>
              <Input
                id="riskName"
                value={newRiskData.riskName}
                onChange={(e) =>
                  setNewRiskData({ ...newRiskData, riskName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            {/* Risk Owner */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="riskOwner" className="text-right">
                Owner
              </label>
              <Input
                id="riskOwner"
                value={newRiskData.riskOwner}
                onChange={(e) =>
                  setNewRiskData({ ...newRiskData, riskOwner: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            {/* Severity */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="severity" className="text-right">
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
            {/* You could add Textarea for justification/mitigation here */}
          </div>
          <Button
            onClick={() => {
              handleAddRisk(newRiskData);
              // handleAddRisk will close the dialog on success
            }}
          >
            Create Risk
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ... (DetailView remains exactly the same) ...
  const DetailView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all risks
          </Button>
          <div className="text-sm text-muted-foreground">
            murat.uinnain@anecdotes.ai • Today • Last updated by
          </div>
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
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800"
            >
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
              Risk details content will be displayed here
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
                    High (12)
                  </Badge>
                </div>
                <div></div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Financial impact
                  </span>
                  <div className="text-sm mt-1">Not set</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Residual risk</h4>
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
                    High (12)
                  </Badge>
                </div>
                <div></div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Financial impact
                  </span>
                  <div className="text-sm mt-1">Not set</div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Target risk level
              </span>
              <Badge className="bg-teal-500 text-white ml-2">Medium</Badge>
            </div>
            <div className="text-right">
              <Button variant="link" className="text-blue-600">
                How is the Risk level calculated?
              </Button>
            </div>
          </CardContent>
        )}
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

export default AIRiskAssessment;
