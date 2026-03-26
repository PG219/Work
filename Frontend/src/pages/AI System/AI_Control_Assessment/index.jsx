import React, { useEffect, useState, Fragment, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  ChevronsUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // 1. Import pagination icons
import controlService from "@/services/controlService";
import { Menu, Transition } from "@headlessui/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Import Combobox components from your UI library
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

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ... (getStatusBadge, statusOptions, etc. remain the same) ...
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Implemented", label: "Implemented" },
  { value: "In Progress", label: "In Progress" },
  { value: "Not Implemented", label: "Not Implemented" },
];

const dropdownStatusOptions = ["Implemented", "In Progress", "Not Implemented"];

const getStatusBadge = (status) => {
  switch (status) {
    case "Implemented":
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-700">
          {status}
        </Badge>
      );
    case "In Progress":
      return (
        <Badge className="bg-yellow-600 text-white hover:bg-yellow-700">
          In Progress
        </Badge>
      );
    case "Not Implemented":
      return (
        <Badge className="bg-red-600 text-white hover:bg-red-700">
          {status}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const AIControlAssessment = () => {
  const [controls, setControls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  // Add state for the Combobox popover
  const [isProjectPopoverOpen, setProjectPopoverOpen] = useState(false);

  // 2. Add Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // Set items per page to 15

  // 3. Add useEffect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [status, selectedProjectId]);

  useEffect(() => {
    const fetchControlsAndProjects = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all controls initially to populate the project list correctly
        const allControlsResult = await controlService.getControlsBySystemType(
          "AI",
          { limit: 1000 } // Fetch a larger number to get a good project list
        );

        const allFetchedControls = allControlsResult.controls || [];

        // Create a unique list of all available projects
        const uniqueProjects = [
          ...new Map(
            allFetchedControls.map((c) => [
              c.projectId,
              { projectId: c.projectId, name: c.projectId }, // Assuming name is same as ID for now
            ])
          ).values(),
        ].filter((p) => p.projectId); // Filter out any null/undefined projectIds

        setProjects(uniqueProjects);

        // Now, filter the controls based on the selected filters
        let filteredControls = allFetchedControls;
        if (status !== "all") {
          filteredControls = filteredControls.filter(
            (c) => c.status === status
          );
        }
        if (selectedProjectId !== "all") {
          filteredControls = filteredControls.filter(
            (c) => c.projectId === selectedProjectId
          );
        }
        setControls(filteredControls);
      } catch (e) {
        setError(e.message || "Failed to load data");
        setControls([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchControlsAndProjects();
  }, [status, selectedProjectId]);

  // Create derived lists for recent and all other projects
  const { recentProjects, allOtherProjects } = useMemo(() => {
    const recents = projects.slice(0, 4);
    const others = projects.slice(4);
    return { recentProjects: recents, allOtherProjects: others };
  }, [projects]);

  // ... (handleStatusChange, handleExportExcel, handleExportPDF remain the same) ...
  const handleStatusChange = (controlId, newStatus) => {
    setControls((prevControls) =>
      prevControls.map((control) =>
        control._id === controlId ? { ...control, status: newStatus } : control
      )
    );
    controlService
      .updateControl(controlId, { status: newStatus })
      .catch((err) => {
        console.error("Failed to update control status:", err);
      });
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await controlService.getControlsBySystemType("AI", {
        limit: 1000,
      });
      const allControls = response.controls || [];
      const dataToExport = allControls.map((control) => ({
        Code: control.code,
        Section: control.section,
        Control: control.control,
        Requirements: control.requirements,
        "Risk Associated": control.relatedRisks,
        Status: control.status,
        Tickets: control.tickets,
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AI Controls");
      XLSX.writeFile(workbook, "AI_Controls_Export.xlsx");
    } catch (err) {
      console.error("Failed to export to Excel:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await controlService.getControlsBySystemType("AI", {
        limit: 1000,
      });
      const allControls = response.controls || [];
      const doc = new jsPDF();
      doc.text("AI System Controls Assessment Report", 14, 16);
      const tableColumn = ["Code", "Control", "Risk Associated", "Status"];
      const tableRows = allControls.map((control) => [
        control.code,
        control.control,
        control.relatedRisks || "N/A",
        control.status,
      ]);
      doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
      doc.save("AI_Controls_Export.pdf");
    } catch (err) {
      console.error("Failed to export to PDF:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Add Pagination Logic
  const totalControls = controls.length;
  const totalPages = Math.ceil(totalControls / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedControls = controls.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  // --- End Pagination Logic ---

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI System Controls Assessment</span>
          <div className="flex flex-wrap gap-2 z-10">
            {/* Export Menu remains the same */}
            <Menu as="div" className="relative inline-block text-left">
              {/* ... menu content ... */}
              <Menu.Button
                as={Button}
                variant="outline"
                size="sm"
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export"}
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-popover p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleExportExcel}
                          className={cn(
                            "group flex w-full items-center rounded-md px-2 py-2 text-sm text-left",
                            active && "bg-secondary"
                          )}
                        >
                          Export as Excel (.xlsx)
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleExportPDF}
                          className={cn(
                            "group flex w-full items-center rounded-md px-2 py-2 text-sm text-left",
                            active && "bg-secondary"
                          )}
                        >
                          Export as PDF (.pdf)
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* REPLACE the old project <Select> with this new <Popover> Combobox */}
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
                    : projects.find((p) => p.projectId === selectedProjectId)
                        ?.name || "Select a Project"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 z-50"> {/* Added z-index */}
                <Command>
                  <CommandInput placeholder="Search projects..." />
                  <CommandList>
                    <CommandEmpty>No project found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setSelectedProjectId("all");
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
                              key={p.projectId}
                              value={p.name}
                              onSelect={() => { // Simplified onSelect
                                setSelectedProjectId(p.projectId);
                                setProjectPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProjectId === p.projectId
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
                              key={p.projectId}
                              value={p.name}
                              onSelect={() => {
                                setSelectedProjectId(p.projectId);
                                setProjectPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProjectId === p.projectId
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

            {/* Status Filter remains the same */}
            <Select value={status} onValueChange={setStatus}>
              {/* ... select content ... */}
              <SelectTrigger className="w-40">
                <SelectValue>
                  {statusOptions.find((opt) => opt.value === status)?.label ||
                    "All Statuses"}
                </SelectValue>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ... The rest of your component (Table rendering) remains exactly the same ... */}
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">
            Loading controls…
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">{error}</div>
        ) : controls.length === 0 ? ( // 5. Check original list length
          <div className="p-6 text-center text-muted-foreground">
            No controls found for the selected filters.
          </div>
        ) : (
          <> {/* 6. Wrap Table and Pagination */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CODE</TableHead>
                  <TableHead>SECTION</TableHead>
                  <TableHead>CONTROL</TableHead>
                  <TableHead>REQUIREMENTS</TableHead>
                  <TableHead>RISK ASSOCIATED</TableHead>
                  <TableHead>PROJECT</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>TICKETS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 7. Map over paginated list */}
                {paginatedControls.map((item) => (
                  <TableRow key={item._id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {item.code}
                    </TableCell>
                    <TableCell>{item.section}</TableCell>
                    <TableCell>{item.control}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-md">
                      {item.requirements}
                    </TableCell>
                    <TableCell>{item.relatedRisks || "N/A"}</TableCell>
                    <TableCell>{item.projectId || "N/A"}</TableCell>
                    <TableCell>
                      <Menu
                        as="div"
                        className="relative inline-block text-left w-full"
                      >
                        <Menu.Button
                          as={Button}
                          variant="ghost"
                          className="w-full justify-start p-0 h-auto"
                        >
                          {getStatusBadge(item.status)}
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-popover p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                            <div className="px-1 py-1">
                              {dropdownStatusOptions.map((dropdownStatus) => (
                                <Menu.Item
                                  key={dropdownStatus}
                                  disabled={item.status === dropdownStatus}
                                >
                                  {({ active, disabled }) => (
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          item._id,
                                          dropdownStatus
                                        )
                                      }
                                      className={cn(
                                        "group flex w-full items-center rounded-md px-2 py-2 text-sm text-left",
                                        active && "bg-secondary",
                                        disabled &&
                                          "opacity-50 cursor-not-allowed"
                                      )}
                                      disabled={disabled}
                                    >
                                      {dropdownStatus}
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </TableCell>
                    <TableCell>
                      {item.tickets === "None" ? (
                        <span className="text-muted-foreground">None</span>
                      ) : (
                        <Badge variant="outline">{item.tickets}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 8. Add Pagination Controls */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({totalControls} total
                  controls)
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
            {/* --- End Pagination Controls --- */}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIControlAssessment;
