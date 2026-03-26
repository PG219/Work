import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '../components/ui/progress';
import { Badge } from "@/components/ui/badge";

const ComplianceCard = ({ title, description, progress, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "assessment":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "not-started":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "compliant":
        return "Compliant";
      case "in-progress":
        return "In Progress";
      case "assessment":
        return "Assessment";
      case "not-started":
        return "Not Started";
      default:
        return status;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {getStatusText(status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceCard;
