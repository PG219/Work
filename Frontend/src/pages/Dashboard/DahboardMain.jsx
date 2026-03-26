import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card"; // CardContent removed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Settings,
  FileText,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Check,
} from "lucide-react";
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
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getProjects, updateProjectStatus } from "@/services/projectService";
import ProjectAgingChart from "./components/ProjectAgingChart";
import ProjectStatusChart from "./components/ProjectStatusChart";

// --- CN Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ---------------- UI HELPERS ----------------
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "in progress":
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case "pending approval":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "open":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "failed":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

// ❌ chartConfig removed from here

// ---------------- MAIN COMPONENT ----------------
const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter State ---
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState("all");
  const [isTemplatePopoverOpen, setTemplatePopoverOpen] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // --- End Pagination State ---

  const navigate = useNavigate();

  // ✅ Fetch projects from backend
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch projects.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- REFACTORED SEARCH HANDLER ---
  const handleSearch = (query) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };
  // --- END REFACTOR ---

  // --- Filter Handlers ---
  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleTemplateFilterChange = (template) => {
    setSelectedTemplate(template);
    setCurrentPage(1);
    setTemplatePopoverOpen(false);
  };
  // --- End Filter Handlers ---

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      await updateProjectStatus(projectId, newStatus);
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === projectId ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      console.error("Failed to update project status:", err);
    }
  };

  // --- Derive Filter Options ---
  const { uniqueTemplates, uniqueStatuses } = useMemo(() => {
    const templates = new Set();
    const statuses = new Set();
    projects.forEach(p => {
      if (p.template) templates.add(p.template);
      if (p.status) statuses.add(p.status);
    });
    return {
      uniqueTemplates: Array.from(templates),
      uniqueStatuses: Array.from(statuses),
    };
  }, [projects]);

  // ✅ Updated Search filter (client-side)
  const filteredProjects = projects.filter((project) => {
    const nameMatch = project.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus === 'all' || project.status === selectedStatus;
    const templateMatch = selectedTemplate === 'all' || project.template === selectedTemplate;
    return nameMatch && statusMatch && templateMatch;
  });

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  // --- End Pagination Logic ---

  // Helper function for formatting date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (e) {
      return "N/A";
    }
  };

  // ✅ Dynamic Status Data for Chart (using filtered projects)
  const dynamicStatusData = Object.values(
    filteredProjects.reduce((acc, project) => {
      const statusName = project.status || "Unknown";
      if (!acc[statusName]) {
        acc[statusName] = { name: statusName, value: 0 };
      }
      acc[statusName].value++;
      return acc;
    }, {})
  );

  // --- Dynamic Aging Chart Data ---
  const dynamicAgingData = useMemo(() => {
    const buckets = {
      "0-3": 0,
      "4-6": 0,
      "7-9": 0,
      "10-12": 0,
      "12+": 0,
    };
    let invalidCount = 0;
    const now = new Date();

    filteredProjects.forEach((project) => {
      if (!project.createdAt) {
        invalidCount++;
        return;
      }
      
      const createdAt = new Date(project.createdAt);
      if (isNaN(createdAt.getTime())) {
        invalidCount++;
        return;
      }

      const yearDiff = now.getFullYear() - createdAt.getFullYear();
      const monthDiff = (yearDiff * 12) + (now.getMonth() - createdAt.getMonth());

      if (monthDiff <= 3) {
        buckets["0-3"]++;
      } else if (monthDiff <= 6) {
        buckets["4-6"]++;
      } else if (monthDiff <= 9) {
        buckets["7-9"]++;
      } else if (monthDiff <= 12) {
        buckets["10-12"]++;
      } else {
        buckets["12+"]++;
      }
    });

    if (invalidCount > 0) {
      console.warn(`[Aging Chart] Skipped ${invalidCount} projects with invalid or missing 'createdAt' dates.`);
    }

    return Object.keys(buckets).map(key => ({
      months: key,
      value: buckets[key],
    }));
  }, [filteredProjects]);
  // --- END DYNAMIC DATA ---


  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects and assessments
          </p>
        </div>

        {/* ✅ --- CHARTS (Refactored) --- ✅ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Status Chart */}
          <ProjectStatusChart data={dynamicStatusData} />

          {/* Aging Chart */}
          <ProjectAgingChart data={dynamicAgingData} />
        </div>
        {/* ✅ --- END CHARTS --- ✅ */}


        {/* Search + Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search Projects"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* --- NEW FILTERS --- */}
            <Select
              value={selectedStatus}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover
              open={isTemplatePopoverOpen}
              onOpenChange={setTemplatePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isTemplatePopoverOpen}
                  className="w-full md:w-[200px] justify-between"
                >
                  {selectedTemplate === "all"
                    ? "Select a Template"
                    : selectedTemplate}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search templates..." />
                  <CommandList>
                    <CommandEmpty>No template found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => handleTemplateFilterChange("all")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTemplate === "all"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        All Templates
                      </CommandItem>
                      {uniqueTemplates.map((template) => (
                         <CommandItem
                          key={template}
                          value={template}
                          onSelect={() => handleTemplateFilterChange(template)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTemplate === template
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {template}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* --- END NEW FILTERS --- */}

          </div>
        </div>

        {/* Data Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Loading projects...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-destructive py-10"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : paginatedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No projects found
                    {searchTerm ? " matching your search" : ""}.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProjects.map((project) => (
                  <TableRow key={project.projectId}>
                    <TableCell className="font-medium">
                      {project.projectId}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          navigate(`/projects/${project.projectId}`)
                        }
                        className="text-primary hover:underline"
                      >
                        {project.projectName || "N/A"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {project.workflow || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {project.template || "N/A"}
                    </TableCell>
                    <TableCell>
                      <button className="text-primary hover:underline">
                        {project.owner?.name || "N/A"}
                      </button>
                    </TableCell>
                    <TableCell>{formatDate(project.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(project.projectId, "Open")
                            }
                          >
                            Set to Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(
                                project.projectId,
                                "In Progress"
                              )
                            }
                          >
                            Set to In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(
                                project.projectId,
                                "Pending Approval"
                              )
                            }
                          >
                            Set to Pending Approval
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(project.projectId, "Approved")
                            }
                          >
                            Set to Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(project.projectId, "Failed")
                            }
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            Set to Failed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Pagination Controls */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredProjects.length}{" "}
                total projects)
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          {/* End Pagination Controls */}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;