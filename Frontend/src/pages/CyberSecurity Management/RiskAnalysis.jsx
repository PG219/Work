import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Target, Shield, BarChart3, Activity, ArrowUp, ArrowDown, Minus } from "lucide-react";

const RiskAnalysis = () => {
  const [activeTab, setActiveTab] = useState("inherent");

  // Sample risk data
  const inherentRiskData = [
    { name: 'Critical', value: 8, color: '#dc2626' },
    { name: 'High', value: 15, color: '#ea580c' },
    { name: 'Medium', value: 32, color: '#ca8a04' },
    { name: 'Low', value: 45, color: '#16a34a' }
  ];

  const residualRiskData = [
    { name: 'Critical', value: 2, color: '#dc2626' },
    { name: 'High', value: 8, color: '#ea580c' },
    { name: 'Medium', value: 25, color: '#ca8a04' },
    { name: 'Low', value: 65, color: '#16a34a' }
  ];

  const targetRiskData = [
    { name: 'Critical', value: 0, color: '#dc2626' },
    { name: 'High', value: 3, color: '#ea580c' },
    { name: 'Medium', value: 15, color: '#ca8a04' },
    { name: 'Low', value: 82, color: '#16a34a' }
  ];

  const riskMetrics = [
    {
      asset: "Customer Service Chatbot",
      inherent: { level: "Medium", score: 65, trend: "stable" },
      residual: { level: "Low", score: 25, trend: "down" },
      target: { level: "Low", score: 20, trend: "target" }
    },
    {
      asset: "Fraud Detection System",
      inherent: { level: "High", score: 85, trend: "up" },
      residual: { level: "Medium", score: 45, trend: "down" },
      target: { level: "Low", score: 30, trend: "target" }
    },
    {
      asset: "Recommendation Engine",
      inherent: { level: "Medium", score: 55, trend: "stable" },
      residual: { level: "Low", score: 20, trend: "down" },
      target: { level: "Low", score: 15, trend: "target" }
    },
    {
      asset: "Document Processing AI",
      inherent: { level: "High", score: 75, trend: "stable" },
      residual: { level: "Medium", score: 40, trend: "down" },
      target: { level: "Low", score: 25, trend: "target" }
    },
    {
      asset: "Sentiment Analysis Tool",
      inherent: { level: "Low", score: 35, trend: "down" },
      residual: { level: "Low", score: 15, trend: "down" },
      target: { level: "Low", score: 10, trend: "target" }
    }
  ];

  const getRiskBadge = (level) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };



  const inherentRiskDetails = [
    {
      category: "Data Privacy Risks",
      description: "Risk of unauthorized data access or misuse",
      impact: "High",
      likelihood: "Medium",
      score: 75,
      controls: ["Data encryption", "Access controls", "Data minimization"]
    },
    {
      category: "Model Bias Risks",
      description: "Risk of discriminatory outcomes in AI decisions",
      impact: "High",
      likelihood: "High",
      score: 85,
      controls: ["Bias testing", "Diverse training data", "Fairness metrics"]
    },
    {
      category: "Security Vulnerabilities",
      description: "Risk of system compromise or adversarial attacks",
      impact: "Critical",
      likelihood: "Medium",
      score: 90,
      controls: ["Security testing", "Input validation", "Model protection"]
    },
    {
      category: "Regulatory Non-compliance",
      description: "Risk of violating AI governance regulations",
      impact: "High",
      likelihood: "Medium",
      score: 70,
      controls: ["Compliance monitoring", "Regular audits", "Policy updates"]
    }
  ];

  const residualRiskDetails = [
    {
      category: "Data Privacy Risks",
      description: "Remaining risk after implementing privacy controls",
      impact: "Medium",
      likelihood: "Low",
      score: 35,
      mitigation: "Additional encryption protocols implemented"
    },
    {
      category: "Model Bias Risks", 
      description: "Remaining bias risk after fairness measures",
      impact: "Medium",
      likelihood: "Medium",
      score: 45,
      mitigation: "Ongoing bias monitoring and correction in place"
    },
    {
      category: "Security Vulnerabilities",
      description: "Remaining security risk after protective measures",
      impact: "Medium",
      likelihood: "Low",
      score: 40,
      mitigation: "Multi-layered security controls and monitoring active"
    },
    {
      category: "Regulatory Non-compliance",
      description: "Remaining compliance risk after governance measures",
      impact: "Low",
      likelihood: "Low",
      score: 25,
      mitigation: "Continuous compliance monitoring and regular updates"
    }
  ];

  const targetRiskLevels = [
    {
      category: "Data Privacy Risks",
      currentScore: 35,
      targetScore: 20,
      timeline: "Q1 2025",
      actions: ["Implement zero-trust architecture", "Enhanced data governance"],
      owner: "Data Protection Officer"
    },
    {
      category: "Model Bias Risks",
      currentScore: 45,
      targetScore: 25,
      timeline: "Q2 2025", 
      actions: ["Advanced fairness algorithms", "Expanded bias testing"],
      owner: "AI Ethics Team"
    },
    {
      category: "Security Vulnerabilities",
      currentScore: 40,
      targetScore: 15,
      timeline: "Q1 2025",
      actions: ["Advanced threat detection", "Security hardening"],
      owner: "Security Team"
    },
    {
      category: "Regulatory Non-compliance",
      currentScore: 25,
      targetScore: 10,
      timeline: "Q3 2025",
      actions: ["Automated compliance monitoring", "Regular training"],
      owner: "Compliance Team"
    }
  ];

  return (
    <div className="flex-1 min-h-screen bg-background">
        <main className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-8 h-8" />
                  Risk Analysis Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive risk assessment covering inherent, residual, and target risk levels
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-max grid-cols-3 mb-6 bg-gradient-to-r from-card via-card/80 to-card p-2 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
              <TabsTrigger 
                value="inherent" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Inherent Risk
              </TabsTrigger>
              <TabsTrigger 
                value="residual" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Residual Risk
              </TabsTrigger>
              <TabsTrigger 
                value="target" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Target Risk Level
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inherent" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Inherent Risk Distribution
                    </CardTitle>
                    <CardDescription>Risk levels before any controls or mitigation measures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={inherentRiskData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {inherentRiskData.map((entry, index) => (
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
                    <CardTitle>Risk Assessment Summary</CardTitle>
                    <CardDescription>Key metrics for inherent risk across AI systems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">Total Risk Score</span>
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High (72/100)</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">Critical Risks Identified</span>
                        <span className="font-bold text-red-600">8</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">High Priority Actions</span>
                        <span className="font-bold text-orange-600">15</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">Risk Categories</span>
                        <span className="font-bold">4</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Inherent Risk Details</CardTitle>
                  <CardDescription>Detailed breakdown of inherent risks by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Likelihood</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Existing Controls</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inherentRiskDetails.map((risk, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{risk.category}</TableCell>
                          <TableCell>{risk.description}</TableCell>
                          <TableCell>{getRiskBadge(risk.impact)}</TableCell>
                          <TableCell>{getRiskBadge(risk.likelihood)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={risk.score} className="w-16 h-2" />
                              <span className="text-sm">{risk.score}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {risk.controls.map((control, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {control}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="residual" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Residual Risk Distribution
                    </CardTitle>
                    <CardDescription>Risk levels after implementing controls and mitigation measures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={residualRiskData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {residualRiskData.map((entry, index) => (
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
                    <CardTitle>Risk Reduction Summary</CardTitle>
                    <CardDescription>Effectiveness of implemented risk controls</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">Overall Risk Reduction</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">58% Improvement</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">Critical Risks Remaining</span>
                        <span className="font-bold text-red-600">2</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">Controls Effectiveness</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High (85%)</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded">
                        <span className="font-medium">Mitigation Success Rate</span>
                        <span className="font-bold text-green-600">92%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Residual Risk Assessment</CardTitle>
                  <CardDescription>Current risk levels after mitigation measures</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Current Impact</TableHead>
                        <TableHead>Current Likelihood</TableHead>
                        <TableHead>Residual Score</TableHead>
                        <TableHead>Mitigation Measures</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {residualRiskDetails.map((risk, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{risk.category}</TableCell>
                          <TableCell>{risk.description}</TableCell>
                          <TableCell>{getRiskBadge(risk.impact)}</TableCell>
                          <TableCell>{getRiskBadge(risk.likelihood)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={risk.score} className="w-16 h-2" />
                              <span className="text-sm">{risk.score}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{risk.mitigation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="target" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Target Risk Distribution
                    </CardTitle>
                    <CardDescription>Desired risk levels after planned improvements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={targetRiskData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {targetRiskData.map((entry, index) => (
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
                    <CardTitle>Risk Comparison Overview</CardTitle>
                    <CardDescription>Progress towards target risk levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskMetrics.map((metric, index) => (
                        <div key={index} className="p-3 border rounded">
                          <h4 className="font-medium mb-2">{metric.asset}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Inherent:</span> {getRiskBadge(metric.inherent.level)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Residual:</span> {getRiskBadge(metric.residual.level)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Target:</span> {getRiskBadge(metric.target.level)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Target Risk Roadmap</CardTitle>
                  <CardDescription>Action plan to achieve target risk levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Category</TableHead>
                        <TableHead>Current Score</TableHead>
                        <TableHead>Target Score</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Required Actions</TableHead>
                        <TableHead>Owner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {targetRiskLevels.map((target, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{target.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={target.currentScore} className="w-16 h-2" />
                              <span className="text-sm">{target.currentScore}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={target.targetScore} className="w-16 h-2" />
                              <span className="text-sm">{target.targetScore}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{target.timeline}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {target.actions.map((action, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{target.owner}</TableCell>
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

export default RiskAnalysis;