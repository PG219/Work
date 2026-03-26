import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  Download,
  Eye,
  TrendingUp,
  Target,
  Database,
  FileCheck,
  Clock,
  AlertCircle,
  BarChart3,
} from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for charts
  const riskAssessmentData = [
    { name: "High Risk", value: 12, color: "#ef4444" },
    { name: "Medium Risk", value: 28, color: "#f59e0b" },
    { name: "Low Risk", value: 45, color: "#10b981" },
    { name: "No Risk", value: 15, color: "#6b7280" },
  ];

  const securityComplianceData = [
    { name: "Compliant", value: 65, color: "#10b981" },
    { name: "Partial Compliance", value: 25, color: "#f59e0b" },
    { name: "Non-Compliant", value: 10, color: "#ef4444" },
  ];

  const gapAssessmentData = [
    { framework: "GDPR", compliance: 85, gaps: 15 },
    { framework: "CCPA", compliance: 78, gaps: 22 },
    { framework: "AI Act", compliance: 62, gaps: 38 },
    { framework: "ISO 27001", compliance: 90, gaps: 10 },
    { framework: "SOC 2", compliance: 73, gaps: 27 },
    { framework: "NIST AI RMF", compliance: 68, gaps: 32 },
  ];

  const aiAssets = [
    {
      id: 1,
      name: "Customer Service Chatbot",
      type: "NLP Model",
      risk: "Medium",
      compliance: 85,
      status: "Active",
    },
    {
      id: 2,
      name: "Fraud Detection System",
      type: "ML Model",
      risk: "High",
      compliance: 92,
      status: "Active",
    },
    {
      id: 3,
      name: "Recommendation Engine",
      type: "ML Model",
      risk: "Low",
      compliance: 78,
      status: "Active",
    },
    {
      id: 4,
      name: "Document Processing AI",
      type: "Computer Vision",
      risk: "Medium",
      compliance: 88,
      status: "Under Review",
    },
    {
      id: 5,
      name: "Sentiment Analysis Tool",
      type: "NLP Model",
      risk: "Low",
      compliance: 82,
      status: "Active",
    },
    {
      id: 6,
      name: "Predictive Analytics Engine",
      type: "ML Model",
      risk: "High",
      compliance: 76,
      status: "Active",
    },
    {
      id: 7,
      name: "Voice Recognition System",
      type: "Speech AI",
      risk: "Medium",
      compliance: 91,
      status: "Active",
    },
  ];

  const assignedEngineers = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      designation: "Lead AI Governance Specialist",
      department: "AI Ethics & Compliance",
      email: "sarah.chen@company.com",
      expertise: ["GDPR", "AI Act", "Risk Assessment"],
      avatar: "SC",
      reportType: "Primary Lead",
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      designation: "Senior Security Analyst",
      department: "Cybersecurity",
      email: "michael.rodriguez@company.com",
      expertise: ["ISO 27001", "SOC 2", "Security Frameworks"],
      avatar: "MR",
      reportType: "Security Assessment",
    },
    {
      id: 3,
      name: "Emily Watson",
      designation: "Compliance Manager",
      department: "Legal & Compliance",
      email: "emily.watson@company.com",
      expertise: ["CCPA", "Data Privacy", "Regulatory Compliance"],
      avatar: "EW",
      reportType: "Compliance Review",
    },
  ];

  const policyDocuments = [
    {
      name: "AI Governance Policy v2.1",
      status: "Active",
      lastUpdated: "2024-11-15",
      compliance: 95,
      coverage: "All AI Systems",
    },
    {
      name: "Data Privacy Policy",
      status: "Active",
      lastUpdated: "2024-12-01",
      compliance: 88,
      coverage: "Data Processing",
    },
    {
      name: "AI Ethics Guidelines",
      status: "Under Review",
      lastUpdated: "2024-10-20",
      compliance: 82,
      coverage: "Ethical AI Development",
    },
    {
      name: "Risk Management Framework",
      status: "Active",
      lastUpdated: "2024-11-30",
      compliance: 90,
      coverage: "Risk Assessment",
    },
    {
      name: "Incident Response Plan",
      status: "Active",
      lastUpdated: "2024-12-05",
      compliance: 87,
      coverage: "Security Incidents",
    },
  ];

  const remediationItems = [
    {
      id: 1,
      title: "Implement GDPR Article 22 Compliance",
      priority: "High",
      framework: "GDPR",
      description: "Add automated decision-making transparency features",
      assignee: "Dr. Sarah Chen",
      dueDate: "2025-01-15",
      status: "In Progress",
      progress: 60,
    },
    {
      id: 2,
      title: "Enhance Model Explainability",
      priority: "Medium",
      framework: "AI Act",
      description: "Implement explanation interfaces for high-risk AI systems",
      assignee: "Michael Rodriguez",
      dueDate: "2025-02-01",
      status: "Planned",
      progress: 20,
    },
    {
      id: 3,
      title: "Update Data Retention Policies",
      priority: "Medium",
      framework: "CCPA",
      description: "Align data retention with CCPA requirements",
      assignee: "Emily Watson",
      dueDate: "2025-01-30",
      status: "In Progress",
      progress: 75,
    },
    {
      id: 4,
      title: "Implement Bias Testing Framework",
      priority: "High",
      framework: "AI Act",
      description: "Establish systematic bias detection and mitigation",
      assignee: "Dr. Sarah Chen",
      dueDate: "2025-01-20",
      status: "Not Started",
      progress: 0,
    },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
      case "compliant":
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {status}
          </Badge>
        );
      case "in progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {status}
          </Badge>
        );
      case "under review":
      case "planned":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {status}
          </Badge>
        );
      case "non-compliant":
      case "not started":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk.toLowerCase()) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 min-h-screen bg-background">
      <main className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                AI Governance & Security Report
              </h1>
              <p className="text-muted-foreground">
                Comprehensive regulatory compliance evaluation, risk assessment,
                and governance monitoring
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button className="gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-gradient-to-r from-card via-card/80 to-card p-2 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            >
              AI Assets
            </TabsTrigger>
            <TabsTrigger
              value="governance"
              className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            >
              Governance
            </TabsTrigger>
            <TabsTrigger
              value="policies"
              className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            >
              Policies
            </TabsTrigger>
            <TabsTrigger
              value="gaps"
              className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            >
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger
              value="remediation"
              className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            >
              Remediation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total AI Assets
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {aiAssets.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overall Compliance
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">84%</div>
                  <p className="text-xs text-muted-foreground">
                    +7% from last quarter
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    High Risk Assets
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <p className="text-xs text-muted-foreground">
                    Requires immediate attention
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Policies
                  </CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      policyDocuments.filter((p) => p.status === "Active")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Covering all AI systems
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Risk Assessment Distribution
                  </CardTitle>
                  <CardDescription>
                    AI system risk categorization across the organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskAssessmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {riskAssessmentData.map((entry, index) => (
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
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Security Compliance Status
                  </CardTitle>
                  <CardDescription>
                    Current compliance status across all security frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={securityComplianceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {securityComplianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Assigned Engineers */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Assigned Engineers & Report Ownership
                </CardTitle>
                <CardDescription>
                  Team members responsible for AI governance and compliance
                  oversight
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assignedEngineers.map((engineer) => (
                    <div key={engineer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback>{engineer.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{engineer.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {engineer.designation}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Department:</span>{" "}
                          {engineer.department}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Report Type:</span>{" "}
                          {engineer.reportType}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Expertise:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {engineer.expertise.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  AI Assets Inventory
                </CardTitle>
                <CardDescription>
                  Complete overview of AI systems and their compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Compliance Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">
                          {asset.name}
                        </TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>{getRiskBadge(asset.risk)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={asset.compliance}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">{asset.compliance}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/ai-inventory/${asset.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    AI Governance Compliance
                  </CardTitle>
                  <CardDescription>
                    Following established AI governance frameworks and best
                    practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Ethical AI Principles</h4>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Implemented
                        </Badge>
                      </div>
                      <Progress value={95} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        95% - Fairness, transparency, and accountability
                        measures active
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">
                          Human Oversight Requirements
                        </h4>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          In Progress
                        </Badge>
                      </div>
                      <Progress value={72} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        72% - Human-in-the-loop mechanisms being deployed
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">
                          Risk Management Framework
                        </h4>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                      </div>
                      <Progress value={88} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        88% - Comprehensive risk assessment and mitigation
                        processes
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Data Governance</h4>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Compliant
                        </Badge>
                      </div>
                      <Progress value={91} className="h-2 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        91% - Data quality, lineage, and privacy protection
                        measures
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Governance Metrics
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators for AI governance effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Model Explainability Coverage
                        </span>
                        <span className="text-sm font-bold">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Bias Testing Implementation
                        </span>
                        <span className="text-sm font-bold">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Incident Response Readiness
                        </span>
                        <span className="text-sm font-bold">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Regulatory Compliance Score
                        </span>
                        <span className="text-sm font-bold">84%</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Security Framework Adoption
                        </span>
                        <span className="text-sm font-bold">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Policy Documentation & Coverage
                </CardTitle>
                <CardDescription>
                  Active policies governing AI development, deployment, and
                  operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Coverage Area</TableHead>
                      <TableHead>Compliance Score</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policyDocuments.map((policy, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {policy.name}
                        </TableCell>
                        <TableCell>{getStatusBadge(policy.status)}</TableCell>
                        <TableCell>{policy.coverage}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={policy.compliance}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">
                              {policy.compliance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{policy.lastUpdated}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Gap Assessment by Framework
                  </CardTitle>
                  <CardDescription>
                    Compliance gaps across regulatory frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={gapAssessmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="framework" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="compliance"
                        fill="#10b981"
                        name="Compliance %"
                      />
                      <Bar dataKey="gaps" fill="#ef4444" name="Gaps %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Critical Gap Areas
                  </CardTitle>
                  <CardDescription>
                    Areas requiring immediate attention for compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-red-500 bg-red-50">
                      <h4 className="font-medium text-red-900 mb-2">
                        High Priority Gaps
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>
                          • AI Act compliance for high-risk systems (38% gap)
                        </li>
                        <li>• NIST AI RMF implementation (32% gap)</li>
                        <li>• Algorithmic bias testing procedures</li>
                      </ul>
                    </div>
                    <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        Medium Priority Gaps
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• SOC 2 Type II certification (27% gap)</li>
                        <li>
                          • CCPA automated decision-making disclosure (22% gap)
                        </li>
                        <li>• Model explainability documentation</li>
                      </ul>
                    </div>
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Low Priority Gaps
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>
                          • GDPR automated processing notifications (15% gap)
                        </li>
                        <li>• ISO 27001 documentation updates (10% gap)</li>
                        <li>• Environmental impact reporting</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="remediation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Remediation Plan & Assignments
                </CardTitle>
                <CardDescription>
                  Action items with assigned engineers and timelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Remediation Item</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Assigned Engineer</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {remediationItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.framework}</Badge>
                        </TableCell>
                        <TableCell>{item.assignee}</TableCell>
                        <TableCell>{item.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={item.progress}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">{item.progress}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
