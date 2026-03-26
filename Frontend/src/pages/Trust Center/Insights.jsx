import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Shield, Award, BarChart3, Eye, Calendar, Download } from "lucide-react";
import TrustCenterChatbot from "@/components/trustCentreBot";

const TrustCenterInsight = () => {
  const metrics = [
    {
      title: "Trust Score",
      value: "94%",
      trend: "+2.5%",
      description: "Overall organizational trust rating",
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "Transparency Index",
      value: "87%", 
      trend: "+1.2%",
      description: "Data processing transparency level",
      icon: Eye,
      color: "text-blue-500"
    },
    {
      title: "Compliance Rate",
      value: "98%",
      trend: "+0.8%",
      description: "Regulatory compliance adherence",
      icon: Award,
      color: "text-green-500"
    },
    {
      title: "User Confidence",
      value: "91%",
      trend: "+3.1%",
      description: "Customer trust and satisfaction",
      icon: Users,
      color: "text-purple-500"
    }
  ];

  const insights = [
    {
      category: "Data Privacy",
      title: "Enhanced GDPR Compliance Implementation",
      description: "Successfully implemented advanced data subject rights management, resulting in 15% faster response times to user requests.",
      impact: "High",
      date: "2024-01-15",
      metrics: { before: "72%", after: "87%" }
    },
    {
      category: "Security",
      title: "Multi-Factor Authentication Adoption",
      description: "Increased MFA adoption across all user accounts, significantly reducing security incidents by 45%.",
      impact: "Critical",
      date: "2024-01-12",
      metrics: { before: "65%", after: "94%" }
    },
    {
      category: "Transparency",
      title: "AI Decision Making Documentation",
      description: "Launched comprehensive AI decision audit trails, improving algorithmic transparency and user understanding.",
      impact: "Medium",
      date: "2024-01-10",
      metrics: { before: "40%", after: "76%" }
    }
  ];

  const benchmarks = [
    { category: "Financial Services", score: 89, position: "Top 15%" },
    { category: "Technology", score: 92, position: "Top 10%" },
    { category: "Healthcare", score: 94, position: "Top 5%" },
    { category: "Government", score: 87, position: "Top 20%" }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case "Critical": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Medium": return "bg-yellow-500";
      case "Low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background flex-1">
        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Trust Center Insights</h1>
              <p className="text-muted-foreground">Analytics and metrics for organizational trust and transparency</p>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                    {metric.trend} from last month
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="insights" className="space-y-4">
            <TabsList className="bg-gradient-to-r from-card via-card/80 to-card p-2 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
              <TabsTrigger 
                value="insights" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Recent Insights
              </TabsTrigger>
              <TabsTrigger 
                value="benchmarks" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Industry Benchmarks
              </TabsTrigger>
              <TabsTrigger 
                value="trends" 
                className="relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/25 data-[state=active]:transform data-[state=active]:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
              >
                Trust Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trust & Transparency Insights</CardTitle>
                  <CardDescription>
                    Key improvements and initiatives impacting organizational trust
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{insight.category}</Badge>
                              <Badge 
                                variant="secondary"
                                className={`text-white ${getImpactColor(insight.impact)}`}
                              >
                                {insight.impact} Impact
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {insight.date}
                              </span>
                            </div>
                            <h3 className="font-semibold">{insight.title}</h3>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>Before: <strong>{insight.metrics.before}</strong></span>
                              <span>→</span>
                              <span>After: <strong className="text-green-600">{insight.metrics.after}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Trust Benchmarks</CardTitle>
                  <CardDescription>
                    How we compare against industry standards across different sectors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benchmarks.map((benchmark, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{benchmark.category}</h3>
                          <p className="text-sm text-muted-foreground">Industry ranking: {benchmark.position}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-2xl font-bold">{benchmark.score}%</div>
                          <Progress value={benchmark.score} className="w-24 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trust Score Trends</CardTitle>
                  <CardDescription>
                    Historical trust metrics and projected improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">6 Months Ago</h3>
                        <div className="text-2xl font-bold text-muted-foreground">87%</div>
                        <p className="text-sm text-muted-foreground">Baseline trust score</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Current</h3>
                        <div className="text-2xl font-bold text-blue-600">94%</div>
                        <p className="text-sm text-muted-foreground">+7% improvement</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Projected (6M)</h3>
                        <div className="text-2xl font-bold text-green-600">97%</div>
                        <p className="text-sm text-muted-foreground">+3% target growth</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">Key Growth Drivers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Enhanced data transparency initiatives
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          Improved user communication processes
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          Advanced security implementations
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          Regular third-party audits
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <TrustCenterChatbot />
    </div>
  );
};

export default TrustCenterInsight;