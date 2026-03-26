import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const assessments = [
  {
    title: "AI Chatbot System - High Risk Classification Updated",
    time: "1 day ago",
    type: "high-risk"
  },
  {
    title: "Machine Learning Model - GDPR Compliance Verified",
    time: "2 days ago",
    type: "compliance"
  },
  {
    title: "Automated Decision System - EU AI Act Assessment Pending",
    time: "3 days ago",
    type: "pending"
  },
  {
    title: "Computer Vision System - Risk Controls Implemented",
    time: "4 days ago",
    type: "controls"
  }
];

const RecentAssessments = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Risk Assessments</CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest AI system evaluations and compliance updates
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.map((assessment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm font-medium">{assessment.title}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{assessment.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAssessments;
