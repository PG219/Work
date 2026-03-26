import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  TrendingUp,
  Shield,
  Users,
  FileText,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import demoVideoThumbnail from "@/assets/rakfort-demo-video.jpg";
import ContactSupport from "@/components/contactSupport";

const Demo = () => {
  const demoSections = [
    {
      title: "AI Inventory Management",
      description:
        "Comprehensive catalog of all AI systems across your organization",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      title: "Risk Assessment",
      description: "Automated risk evaluation based on regulatory frameworks",
      icon: Shield,
      color: "text-red-600",
    },
    {
      title: "Compliance Monitoring",
      description:
        "Continuous monitoring for GDPR, EU AI Act, and NIST compliance",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Policy Management",
      description: "Centralized AI governance policies and procedures",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Audit & Reporting",
      description: "Generate comprehensive compliance reports for auditors",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Trust Center",
      description:
        "Transparent communication with stakeholders about AI practices",
      icon: Users,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex-1">
      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            RAKFORT Demo
          </h1>
          <p className="text-muted-foreground">
            Interactive demonstration of AI governance and security features
          </p>
        </div>

        {/* Video Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Overview Video</CardTitle>
            <p className="text-sm text-muted-foreground">
              See how RAKFORT helps organizations manage AI governance,
              security, and compliance
            </p>
          </CardHeader>
          <CardContent>
            <VideoPlayer
              thumbnailSrc={demoVideoThumbnail}
              title="RAKFORT AI Governance Platform Demo"
              description="Learn how we help organizations achieve AI governance excellence"
              duration="5:42"
              secureVideoEndpoint="/video/demo"
              youtubeId="FyVZEAkV64w"
            />
          </CardContent>
        </Card>

        {/* Demo Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Key Benefits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Why Choose RAKFORT?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Key benefits and competitive advantages
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-4 bg-blue-50 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Comprehensive Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  Stay compliant with EU AI Act, GDPR, NIST, and other
                  regulatory frameworks
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-emerald-50 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-semibold mb-2">Real-time Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous monitoring and automated alerts for compliance
                  violations
                </p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-indigo-50 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <h4 className="font-semibold mb-2">Stakeholder Transparency</h4>
                <p className="text-sm text-muted-foreground">
                  Build trust through transparent AI governance and public
                  accountability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
          <ContactSupport />
        </div>
      </main>
    </div>
  );
};

export default Demo;
