import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AIRegulatoryAssessment = () => {
  const regulatoryFrameworks = [
    {
      name: "EU AI Act",
      status: "In Progress",
      compliance: 75,
      deadline: "Dec 2024",
      priority: "High",
      description: "European Union AI Act compliance assessment"
    },
    {
      name: "GDPR",
      status: "Compliant",
      compliance: 100,
      deadline: "Ongoing",
      priority: "Critical",
      description: "General Data Protection Regulation"
    },
    {
      name: "CCPA",
      status: "Assessment",
      compliance: 45,
      deadline: "Mar 2025",
      priority: "Medium",
      description: "California Consumer Privacy Act"
    },
    {
      name: "SOX",
      status: "Pending",
      compliance: 0,
      deadline: "Jun 2025",
      priority: "Low",
      description: "Sarbanes-Oxley Act compliance"
    }
  ];

  const assessmentAreas = [
    { area: "Data Privacy", score: 92, status: "Compliant" },
    { area: "Algorithmic Transparency", score: 78, status: "In Progress" },
    { area: "Human Rights Impact", score: 85, status: "Compliant" },
    { area: "Bias & Fairness", score: 67, status: "Needs Improvement" },
    { area: "Security & Safety", score: 94, status: "Compliant" },
    { area: "Environmental Impact", score: 56, status: "Assessment" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Compliant": return "default";
      case "In Progress": return "secondary";
      case "Assessment": return "outline";
      case "Needs Improvement": return "destructive";
      case "Pending": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return "destructive";
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-background">
        <main className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">AI Regulatory Assessment</h1>
                <p className="text-muted-foreground">
                  Comprehensive regulatory compliance evaluation and monitoring
                </p>
              </div>
              <Button className="bg-primary text-primary-foreground">
                Start New Assessment
              </Button>
            </div>
          </div>

          <Tabs defaultValue="compliance-overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-card via-card/80 to-card p-2 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
              <TabsTrigger 
                value="compliance-overview" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Compliance Overview
              </TabsTrigger>
              <TabsTrigger 
                value="framework-analysis" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Framework Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="gap-assessment" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Gap Assessment
              </TabsTrigger>
              <TabsTrigger 
                value="remediation-plan" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Remediation Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compliance-overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold text-emerald-600 mb-2">8</h3>
                  <p className="text-muted-foreground">Compliant Frameworks</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-2xl font-bold text-amber-600 mb-2">5</h3>
                  <p className="text-muted-foreground">In Progress</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-2xl font-bold text-red-600 mb-2">3</h3>
                  <p className="text-muted-foreground">Non-Compliant</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">82%</h3>
                  <p className="text-muted-foreground">Overall Compliance</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Regulatory Frameworks</h3>
                  <div className="space-y-4">
                    {regulatoryFrameworks.map((framework, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{framework.name}</h4>
                            <p className="text-sm text-muted-foreground">{framework.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(framework.priority)}>{framework.priority}</Badge>
                            <Badge variant={getStatusColor(framework.status)}>{framework.status}</Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Compliance Progress</span>
                          <span className="text-sm font-medium">{framework.compliance}%</span>
                        </div>
                        <Progress value={framework.compliance} className="h-2 mb-2" />
                        <div className="text-xs text-muted-foreground">
                          Deadline: {framework.deadline}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Assessment Areas</h3>
                  <div className="space-y-4">
                    {assessmentAreas.map((area, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{area.area}</span>
                            <span className="text-sm font-medium">{area.score}%</span>
                          </div>
                          <Progress value={area.score} className="h-2 mb-2" />
                          <Badge variant={getStatusColor(area.status)} className="text-xs">
                            {area.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="framework-analysis" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Framework Requirements</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">EU AI Act Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Risk classification and assessment</li>
                        <li>• Quality management systems</li>
                        <li>• Data governance and training datasets</li>
                        <li>• Record-keeping and documentation</li>
                        <li>• Transparency and provision of information</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">GDPR Compliance</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Data protection impact assessments</li>
                        <li>• Privacy by design implementation</li>
                        <li>• Individual rights and consent management</li>
                        <li>• Data breach notification procedures</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
                  <div className="space-y-4">
                    {regulatoryFrameworks.map((framework, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{framework.name}</h4>
                          <Badge variant={getStatusColor(framework.status)}>{framework.status}</Badge>
                        </div>
                        <Progress value={framework.compliance} className="h-2 mb-2" />
                        <p className="text-sm text-muted-foreground">{framework.compliance}% complete</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gap-assessment" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Identified Gaps</h3>
                  <div className="space-y-4">
                    <div className="p-4 border-l-4 border-red-500 bg-red-50">
                      <h4 className="font-medium text-red-900 mb-2">Critical Gaps</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Algorithmic bias testing procedures</li>
                        <li>• Human oversight mechanisms</li>
                        <li>• Risk management documentation</li>
                      </ul>
                    </div>
                    <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                      <h4 className="font-medium text-yellow-900 mb-2">Medium Priority</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Data quality assessment protocols</li>
                        <li>• Model explainability features</li>
                        <li>• Incident response procedures</li>
                      </ul>
                    </div>
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-medium text-blue-900 mb-2">Low Priority</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Environmental impact reporting</li>
                        <li>• Third-party audit schedules</li>
                        <li>• Training record maintenance</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Risk Analysis</h3>
                  <div className="space-y-4">
                    {assessmentAreas.filter(area => area.score < 80).map((area, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{area.area}</h4>
                          <Badge variant={getStatusColor(area.status)}>{area.status}</Badge>
                        </div>
                        <Progress value={area.score} className="h-2 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Current score: {area.score}% | Target: 85%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Gap: {85 - area.score} percentage points to target compliance
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="remediation-plan" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Action Plan</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Phase 1: Critical Issues</h4>
                        <Badge variant="destructive">High Priority</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Target: 30 days</p>
                      <ul className="text-sm space-y-1">
                        <li>• Implement bias testing framework</li>
                        <li>• Establish human oversight protocols</li>
                        <li>• Create risk assessment documentation</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Phase 2: Medium Priority</h4>
                        <Badge variant="secondary">Medium Priority</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Target: 60 days</p>
                      <ul className="text-sm space-y-1">
                        <li>• Enhance data quality processes</li>
                        <li>• Develop explainability features</li>
                        <li>• Update incident response plans</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Phase 3: Optimization</h4>
                        <Badge variant="outline">Low Priority</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Target: 90 days</p>
                      <ul className="text-sm space-y-1">
                        <li>• Environmental impact assessment</li>
                        <li>• Third-party audit preparation</li>
                        <li>• Training program optimization</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Resource Allocation</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Budget Requirements</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Technical Implementation</span>
                          <span className="text-sm font-medium">$150,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Compliance Training</span>
                          <span className="text-sm font-medium">$50,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">External Audits</span>
                          <span className="text-sm font-medium">$75,000</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-medium">Total Investment</span>
                          <span className="font-medium">$275,000</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Team Requirements</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 2 AI Ethics Specialists</li>
                        <li>• 1 Compliance Manager</li>
                        <li>• 3 Technical Developers</li>
                        <li>• 1 Legal Advisor</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Success Metrics</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 95% compliance score target</li>
                        <li>• Zero critical violations</li>
                        <li>• Quarterly audit readiness</li>
                        <li>• Stakeholder satisfaction ≥85%</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  );
};

export default AIRegulatoryAssessment;