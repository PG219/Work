import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


const ThirdPartyAssessment = () => {
  const [activeTab, setActiveTab] = useState("vendors");

  const vendors = [
    { id: 1, name: "Alpha AI", type: "AI/ML Services", project: "Project A" },
    { id: 2, name: "DataSecure Inc.", type: "Cybersecurity", project: "Project B" },
    { id: 3, name: "NeuralCloud", type: "Cloud Infrastructure", project: "Project A" },
  ];

  const risks = [
    {
      id: 1,
      vendor: "Alpha AI",
      level: "High",
      description: "Unclear data usage policy",
      project: "Project A",
    },
    {
      id: 2,
      vendor: "DataSecure Inc.",
      level: "Medium",
      description: "Pending SOC 2 certification",
      project: "Project B",
    },
    {
      id: 3,
      vendor: "NeuralCloud",
      level: "Very High",
      description: "Frequent downtimes affecting availability",
      project: "Project A",
    },
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case "Very High":
        return "text-red-800";
      case "High":
        return "text-orange-800";
      case "Medium":
        return "text-yellow-800";
      case "Low":
        return "text-green-800";
      case "Very Low":
        return "text-lime-800";
      default:
        return "text-gray-800";
    }
  };

  const riskCountByLevel = {
    "Very High": risks.filter(r => r.level === "Very High").length,
    "High": risks.filter(r => r.level === "High").length,
    "Medium": risks.filter(r => r.level === "Medium").length,
    "Low": risks.filter(r => r.level === "Low").length,
    "Very Low": risks.filter(r => r.level === "Very Low").length,
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Third Party Assessment</h1>
          <p className="text-gray-600 mt-2">
            Manage and assess third-party vendors and their associated risks
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          {/* Vendors Tab */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Vendor Management</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage external entities that provide AI-related products, services, or components
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Vendor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <select className="border rounded px-3 py-2 text-sm">
                    <option>All Projects</option>
                  </select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.type}</TableCell>
                        <TableCell>{vendor.project}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Risk Assessment</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monitor and manage risks associated with third-party vendors
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Risk
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Risk Statistics */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {Object.entries(riskCountByLevel).map(([level, count]) => (
                    <Card key={level} className={`text-center ${getRiskColor(level)}`}>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold mb-1">{count}</div>
                        <div className="text-sm font-medium">{level}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <select className="border rounded px-3 py-2 text-sm">
                    <option>All Projects</option>
                  </select>
                  <select className="border rounded px-3 py-2 text-sm">
                    <option>All Vendors</option>
                  </select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map((risk) => (
                      <TableRow key={risk.id}>
                        <TableCell className="font-medium">{risk.vendor}</TableCell>
                        <TableCell>
                          <Badge className={getRiskColor(risk.level)}>{risk.level}</Badge>
                        </TableCell>
                        <TableCell>{risk.description}</TableCell>
                        <TableCell>{risk.project}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThirdPartyAssessment;
