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
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const AIInventory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const aiAssets = [
    {
      id: 1,
      name: "Customer Service Chatbot",
      type: "NLP Model",
      risk: "Medium",
      compliance: 85,
      status: "Active",
      description: "AI-powered customer support chatbot for handling inquiries",
      frameworks: ["GDPR", "AI Act", "ISO 27001"],
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      name: "Fraud Detection System",
      type: "ML Model",
      risk: "High",
      compliance: 92,
      status: "Active",
      description: "Machine learning system for detecting fraudulent transactions",
      frameworks: ["GDPR", "AI Act", "SOC 2", "NIST AI RMF"],
      lastUpdated: "2024-01-10",
    },
    {
      id: 3,
      name: "Recommendation Engine",
      type: "ML Model",
      risk: "Low",
      compliance: 78,
      status: "Active",
      description: "Product recommendation system based on user behavior",
      frameworks: ["GDPR", "CCPA"],
      lastUpdated: "2024-01-12",
    },
    {
      id: 4,
      name: "Document Processing AI",
      type: "Computer Vision",
      risk: "Medium",
      compliance: 88,
      status: "Under Review",
      description: "AI system for automated document classification and processing",
      frameworks: ["GDPR", "AI Act", "ISO 27001"],
      lastUpdated: "2024-01-08",
    },
    {
      id: 5,
      name: "Sentiment Analysis Tool",
      type: "NLP Model",
      risk: "Low",
      compliance: 82,
      status: "Active",
      description: "Text analysis tool for customer sentiment evaluation",
      frameworks: ["GDPR", "CCPA"],
      lastUpdated: "2024-01-14",
    },
    {
      id: 6,
      name: "Predictive Analytics Engine",
      type: "ML Model",
      risk: "High",
      compliance: 76,
      status: "Active",
      description: "Advanced analytics system for business forecasting",
      frameworks: ["GDPR", "AI Act", "NIST AI RMF"],
      lastUpdated: "2024-01-05",
    },
    {
      id: 7,
      name: "Voice Recognition System",
      type: "Speech AI",
      risk: "Medium",
      compliance: 91,
      status: "Active",
      description: "Voice-to-text and speech recognition system",
      frameworks: ["GDPR", "AI Act", "ISO 27001"],
      lastUpdated: "2024-01-13",
    },
    {
      id: 8,
      name: "Call Center AI Assistant",
      type: "NLP Model",
      risk: "Medium",
      compliance: 79,
      status: "Active",
      description: "AI assistant for call center operations and customer support",
      frameworks: ["GDPR", "AI Act", "CCPA"],
      lastUpdated: "2024-01-11",
    },
  ];

  const getRiskBadge = (risk) => {
    switch (risk) {
      case "High":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Risk</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Risk</Badge>;
      case "Low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "Under Review":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>;
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAssetClick = (assetId) => {
    navigate(`/ai-inventory/${assetId}`);
  };

  const filteredAssets = aiAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-background">
      <main className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Database className="w-8 h-8" />
                AI Inventory
              </h1>
              <p className="text-muted-foreground">
                Comprehensive catalog of all AI systems and their compliance status
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Inventory
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Asset
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search assets by name or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
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
              <CardTitle className="text-sm font-medium">High Risk Assets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {aiAssets.filter(asset => asset.risk === "High").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {aiAssets.filter(asset => asset.status === "Active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently operational
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(aiAssets.reduce((sum, asset) => sum + asset.compliance, 0) / aiAssets.length)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall compliance score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assets Table */}
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
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow 
                    key={asset.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleAssetClick(asset.id)}
                  >
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
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {asset.lastUpdated}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssetClick(asset.id);
                        }}
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
      </main>
    </div>
  );
};

export default AIInventory; 