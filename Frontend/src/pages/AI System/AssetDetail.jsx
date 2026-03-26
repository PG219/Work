import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Database,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  Settings,
  Users,
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
  BarChart3,
  Workflow,
  FileCheck,
} from "lucide-react";

const AssetDetail = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddRiskOpen, setIsAddRiskOpen] = useState(false);

  // Mock asset data
  const assetData = {
    id: assetId,
    name: "Call Center AI Assistant",
    type: "NLP Model",
    risk: "Medium",
    compliance: 79,
    status: "Active",
    description: "AI assistant for call center operations and customer support",
    frameworks: ["GDPR", "AI Act", "CCPA"],
    lastUpdated: "2024-01-11",
    overview: {
      totalCalls: 15420,
      successRate: 87,
      avgResponseTime: "2.3s",
      customerSatisfaction: 4.2,
      uptime: 99.8,
      dataProcessed: "2.3TB",
    },
    risks: [
      {
        id: 1,
        title: "Insufficient User Training",
        category: "Operational Risk",
        severity: "Medium",
        status: "Open",
        description:
          "Call center agents lack proper training on AI system usage",
        impact: "Medium",
        probability: "High",
        mitigation: "Implement comprehensive training program",
        assignedTo: "Training Team",
        dueDate: "2024-02-15",
        progress: 30,
      },
      {
        id: 2,
        title: "Data Privacy Concerns",
        category: "Compliance Risk",
        severity: "High",
        status: "In Progress",
        description: "Potential GDPR violations in customer data processing",
        impact: "High",
        probability: "Medium",
        mitigation: "Review and update data handling procedures",
        assignedTo: "Legal Team",
        dueDate: "2024-01-30",
        progress: 65,
      },
    ],
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case "High":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            High Risk
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium Risk
          </Badge>
        );
      case "Low":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Low Risk
          </Badge>
        );
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "Under Review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Under Review
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background">
      <main className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/ai-inventory")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Inventory
            </Button>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Database className="w-8 h-8" />
                {assetData.name}
              </h1>
              <p className="text-muted-foreground mb-4">
                {assetData.description}
              </p>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{assetData.type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Risk Level:</span>
                  {getRiskBadge(assetData.risk)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge(assetData.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Compliance:</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={assetData.compliance}
                      className="w-16 h-2"
                    />
                    <span className="text-sm">{assetData.compliance}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Asset
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gradient-to-r from-card via-card/80 to-card p-2 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="flex flex-col gap-4">
              {/* Section Title */}
              <div className="text-3xl">Basic Information</div>

              {/* Main Info Row */}
              <div className="flex">
                {/* Left: Basic Info */}
                <div className="flex-[3_3_0%] space-y-4">
                  <div>
                    <div>Use Case Name</div>
                    <div className="text-xl font-bold">{assetData.name}</div>
                  </div>

                  <div>
                    <div>Brief Description</div>
                    <div className="text-xl font-bold">
                      {assetData.description}
                    </div>
                  </div>

                  <div>
                    <div>Use Case Owner</div>
                    <div className="text-xl font-bold">John Doe</div>
                  </div>

                  <div>
                    <div>Use Case Team</div>
                    <div className="text-xl font-bold">Zephyr</div>
                  </div>
                </div>

                {/* Right: Status Box */}
                <div className="flex-[1_1_0%] border-2 h-max p-2 rounded-md bg-white shadow-sm">
                  <div className="flex flex-col gap-1 m-2">
                    <div>Current Status</div>
                    <div className="ml-1 font-bold">Live</div>
                  </div>

                  <div className="flex flex-col gap-1 m-2">
                    <div>Type</div>
                    <div className="ml-1 font-bold">External</div>
                  </div>

                  <div className="flex flex-col gap-1 m-2">
                    <div>Overall Risk Level</div>
                    <div className="ml-1 font-bold">Normal</div>
                  </div>

                  <div className="flex flex-col gap-1 m-2">
                    <div>Use Case Codename</div>
                    <div className="ml-1 font-bold">Live</div>
                  </div>
                </div>
              </div>

              {/* Frameworks Section */}
              <div className="mt-8">
                <div className="text-2xl font-semibold mb-4">Frameworks</div>
                <div className="text-lg font-medium text-gray-600 mb-2">
                  Enabled (4)
                </div>

                <div className="space-y-4">
                  {/* Framework Cards */}
                  <div className="p-4 border rounded bg-gray-50">
                    <div className="text-pink-700 font-semibold">
                      NIST AI RMF
                    </div>
                    <div className="text-sm text-gray-600">
                      National Institute of Standards and Technology Artificial
                      Intelligence Risk Management Framework
                    </div>
                  </div>

                  <div className="p-4 border rounded bg-gray-50">
                    <div className="text-pink-700 font-semibold">EU AI Act</div>
                    <div className="text-sm text-gray-600">
                      European Artificial Intelligence Act
                    </div>
                  </div>

                  <div className="p-4 border rounded bg-gray-50">
                    <div className="text-pink-700 font-semibold">
                      Colorado Life Insurance Regulation
                    </div>
                    <div className="text-sm text-gray-600">
                      Governance and RMF Requirements for ECDIS, Algorithms, and
                      Predictive Models
                    </div>
                  </div>

                  <div className="p-4 border rounded bg-gray-50">
                    <div className="text-pink-700 font-semibold">
                      ISO 42001 Standard
                    </div>
                    <div className="text-sm text-gray-600">
                      ISO Standard for implementing and maintaining Artificial
                      Intelligence Management Systems
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Risk Management
                    </CardTitle>
                    <CardDescription>
                      Identified risks and mitigation strategies
                    </CardDescription>
                  </div>
                  <Dialog open={isAddRiskOpen} onOpenChange={setIsAddRiskOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Risk
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Risk</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label
                            htmlFor="title"
                            className="text-sm font-medium"
                          >
                            Risk Title
                          </label>
                          <Input id="title" placeholder="Enter risk title" />
                        </div>
                        <div className="grid gap-2">
                          <label
                            htmlFor="category"
                            className="text-sm font-medium"
                          >
                            Category
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="operational">
                                Operational Risk
                              </SelectItem>
                              <SelectItem value="compliance">
                                Compliance Risk
                              </SelectItem>
                              <SelectItem value="technical">
                                Technical Risk
                              </SelectItem>
                              <SelectItem value="security">
                                Security Risk
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <label
                            htmlFor="description"
                            className="text-sm font-medium"
                          >
                            Description
                          </label>
                          <Textarea
                            id="description"
                            placeholder="Describe the risk"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddRiskOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setIsAddRiskOpen(false)}>
                          Add Risk
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assetData.risks.map((risk) => (
                    <div key={risk.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium mb-1">{risk.title}</h4>
                          <div className="flex gap-2 mb-2">
                            <Badge variant="outline">{risk.category}</Badge>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {risk.severity} Severity
                            </Badge>
                            <Badge
                              className={
                                risk.status === "Resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {risk.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {risk.description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Impact:
                          </span>
                          <div className="font-medium">{risk.impact}</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Probability:
                          </span>
                          <div className="font-medium">{risk.probability}</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Assigned To:
                          </span>
                          <div className="font-medium">{risk.assignedTo}</div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Due Date:
                          </span>
                          <div className="font-medium">{risk.dueDate}</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Mitigation Progress
                          </span>
                          <span className="text-xs font-medium">
                            {risk.progress}%
                          </span>
                        </div>
                        <Progress value={risk.progress} className="h-2" />
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Mitigation:
                        </span>{" "}
                        {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs placeholder */}
          <TabsContent value="documentation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Documentation content will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Related Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Related assets will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Business Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Business benefits will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  AI Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Workflows will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reports will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AssetDetail;
