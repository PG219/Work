import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Settings, Users } from "lucide-react";

const AIPolicy = () => {
  const policies = [
    {
      title: "AI Ethics Framework",
      description: "Comprehensive guidelines for ethical AI development and deployment",
      status: "Active",
      lastUpdated: "2024-01-15",
      category: "Ethics"
    },
    {
      title: "Data Privacy in AI Systems",
      description: "Policies governing data collection, processing, and storage in AI applications",
      status: "Active",
      lastUpdated: "2024-01-10",
      category: "Privacy"
    },
    {
      title: "AI Risk Management",
      description: "Risk assessment and mitigation strategies for AI implementations",
      status: "Draft",
      lastUpdated: "2024-01-08",
      category: "Risk"
    },
    {
      title: "Algorithmic Accountability",
      description: "Standards for transparency and explainability in AI decision-making",
      status: "Active",
      lastUpdated: "2024-01-05",
      category: "Accountability"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background flex-1">
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">AI Policy Management</h1>
              <p className="text-muted-foreground">Comprehensive policy framework for AI system lifecycle management</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create New Policy
            </Button>
          </div>

          <Tabs defaultValue="pre-deployment" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-card via-card/80 to-card p-2 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
              <TabsTrigger 
                value="pre-deployment" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Pre-deployment
              </TabsTrigger>
              <TabsTrigger 
                value="deployment-criteria" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Deployment Criteria
              </TabsTrigger>
              <TabsTrigger 
                value="environmental" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Environmental Standards
              </TabsTrigger>
              <TabsTrigger 
                value="access-permissions" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Access & Permissions
              </TabsTrigger>
              <TabsTrigger 
                value="decommissioning" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Decommissioning
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pre-deployment" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Pre-deployment Policy Framework</h3>
                  <p className="text-sm text-muted-foreground mb-6">Required assessments and approvals before AI system deployment</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-semibold mb-4">Risk Assessment Requirements</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">Impact Assessment</p>
                            <p className="text-xs text-muted-foreground">Evaluate potential social and ethical impacts</p>
                          </div>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">Bias Testing</p>
                            <p className="text-xs text-muted-foreground">Test for algorithmic bias and fairness</p>
                          </div>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">Security Evaluation</p>
                            <p className="text-xs text-muted-foreground">Assess cybersecurity vulnerabilities</p>
                          </div>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">Performance Validation</p>
                            <p className="text-xs text-muted-foreground">Validate accuracy and reliability metrics</p>
                          </div>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Approval Workflow</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Technical Review</h4>
                        <Badge variant="secondary">5-7 days</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Approver: AI Engineering Team</p>
                    </div>
                    
                    <div className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Security Clearance</h4>
                        <Badge variant="secondary">3-5 days</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Approver: Security Officer</p>
                    </div>
                    
                    <div className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Ethics Review</h4>
                        <Badge variant="secondary">7-10 days</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Approver: AI Ethics Committee</p>
                    </div>
                    
                    <div className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Executive Approval</h4>
                        <Badge variant="secondary">2-3 days</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Approver: CTO/CISO</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Documentation Requirements</h4>
                    <div className="text-sm text-muted-foreground">
                      Model Architecture, Training Data, Performance Metrics, Risk Assessment Report
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="deployment-criteria" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Technical Readiness Criteria</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Performance Standards</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Model accuracy ≥95% on validation datasets</li>
                        <li>• Latency requirements &lt;200ms for real-time systems</li>
                        <li>• System availability ≥99.9% uptime</li>
                        <li>• Error rate &lt;0.1% for critical applications</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Security Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Penetration testing completed</li>
                        <li>• Data encryption at rest and in transit</li>
                        <li>• Authentication and authorization controls</li>
                        <li>• Vulnerability assessment passed</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Compliance Validation</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Regulatory requirements verified</li>
                        <li>• Data protection compliance confirmed</li>
                        <li>• Audit trail implementation</li>
                        <li>• Risk assessment approved</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Operational Readiness</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Infrastructure Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Scalable cloud infrastructure provisioned</li>
                        <li>• Monitoring and alerting systems active</li>
                        <li>• Backup and disaster recovery tested</li>
                        <li>• Load balancing configured</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Team Readiness</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Operations team trained and certified</li>
                        <li>• Support procedures documented</li>
                        <li>• Escalation protocols established</li>
                        <li>• 24/7 support coverage confirmed</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">User Acceptance</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• User acceptance testing completed</li>
                        <li>• Stakeholder sign-off obtained</li>
                        <li>• Training materials prepared</li>
                        <li>• Change management plan executed</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="environmental" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Environmental Impact Assessment</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Carbon Footprint Analysis</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Training phase energy consumption measurement</li>
                        <li>• Inference energy efficiency optimization</li>
                        <li>• Data center sustainability assessment</li>
                        <li>• Carbon offset program participation</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Resource Optimization</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Model compression and pruning applied</li>
                        <li>• Hardware utilization efficiency &gt;80%</li>
                        <li>• Auto-scaling policies implemented</li>
                        <li>• Green computing practices adopted</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Sustainability Metrics</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• PUE (Power Usage Effectiveness) &lt;1.3</li>
                        <li>• Renewable energy usage &gt;50%</li>
                        <li>• Waste heat recovery implementation</li>
                        <li>• E-waste reduction strategies</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Sustainability Standards</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Green AI Principles</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Energy-efficient algorithm selection</li>
                        <li>• Minimal viable model complexity</li>
                        <li>• Sustainable data storage practices</li>
                        <li>• Lifecycle environmental impact assessment</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Reporting Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Monthly energy consumption reports</li>
                        <li>• Quarterly sustainability metrics</li>
                        <li>• Annual environmental impact assessment</li>
                        <li>• ESG compliance documentation</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Continuous Improvement</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Regular efficiency optimization reviews</li>
                        <li>• Technology upgrade planning</li>
                        <li>• Industry best practices adoption</li>
                        <li>• Innovation in green computing</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="access-permissions" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Access Control Framework</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Role-Based Access Control (RBAC)</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• AI Administrator: Full system access and configuration</li>
                        <li>• Data Scientist: Model development and training access</li>
                        <li>• Analyst: Read-only access to results and reports</li>
                        <li>• Auditor: Compliance review and audit trail access</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Authentication Requirements</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Multi-factor authentication (MFA) mandatory</li>
                        <li>• Single sign-on (SSO) integration</li>
                        <li>• Regular password policy enforcement</li>
                        <li>• Biometric authentication for sensitive access</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Data Access Permissions</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Principle of least privilege enforcement</li>
                        <li>• Data classification-based access control</li>
                        <li>• Time-limited access for temporary needs</li>
                        <li>• Geographic restriction policies</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Permission Management</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Access Review Process</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Quarterly access certification reviews</li>
                        <li>• Automated access right recertification</li>
                        <li>• Manager approval for privilege escalation</li>
                        <li>• Regular inactive account cleanup</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Audit and Monitoring</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Real-time access monitoring and alerting</li>
                        <li>• Comprehensive audit trail logging</li>
                        <li>• Suspicious activity detection</li>
                        <li>• Compliance reporting and analytics</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Emergency Procedures</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Break-glass emergency access protocols</li>
                        <li>• Incident response team access rights</li>
                        <li>• Temporary privilege escalation procedures</li>
                        <li>• Post-incident access review requirements</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="decommissioning" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Decommissioning Process</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Phase 1: Pre-Decommissioning</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Stakeholder notification (30 days notice)</li>
                        <li>• Impact assessment and migration planning</li>
                        <li>• User communication strategy</li>
                        <li>• Backup and archival procedures</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Phase 2: Data Handling</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Complete data extraction and export</li>
                        <li>• Secure data transfer to approved systems</li>
                        <li>• Data retention policy compliance</li>
                        <li>• Verification of data integrity</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Phase 3: System Shutdown</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Gradual service reduction and rerouting</li>
                        <li>• Final system shutdown and disconnection</li>
                        <li>• Infrastructure resource deallocation</li>
                        <li>• Certificate and license termination</li>
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Data Security & Compliance</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Secure Data Destruction</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• NIST 800-88 compliant data sanitization</li>
                        <li>• Multi-pass overwriting procedures</li>
                        <li>• Physical destruction of storage media</li>
                        <li>• Certificate of destruction issuance</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Knowledge Transfer</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Documentation handover to successor systems</li>
                        <li>• Model artifacts and metadata preservation</li>
                        <li>• Training data lineage documentation</li>
                        <li>• Lessons learned capture and sharing</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Post-Decommissioning</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Verification of complete data removal</li>
                        <li>• Final audit and compliance confirmation</li>
                        <li>• Resource cost reconciliation</li>
                        <li>• Post-mortem and improvement recommendations</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Policy Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Policies</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Settings className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Policies</p>
                    <p className="text-2xl font-bold">18</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stakeholders</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ethics & Responsibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">AI Ethics Framework</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bias Prevention</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Human Oversight</span>
                    <span className="text-xs text-yellow-600">Draft</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Governance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Data Privacy</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data Quality Standards</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data Retention</span>
                    <span className="text-xs text-blue-600">Review</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance & Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Risk Management</span>
                    <span className="text-xs text-yellow-600">Draft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Regulatory Compliance</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Audit Requirements</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Policy List */}
          <Card>
            <CardHeader>
              <CardTitle>All Policies</CardTitle>
              <p className="text-sm text-muted-foreground">Complete list of AI governance policies and their current status</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{policy.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{policy.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">{policy.category}</span>
                      <span>Last updated: {policy.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  );
};

export default AIPolicy;