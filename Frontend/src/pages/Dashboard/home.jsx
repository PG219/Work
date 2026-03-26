import StatsCard from "../../components/statsCard";
import { AlertTriangle, CheckCircle2, Clock, Database } from "lucide-react";
import ComplianceCard from '../../components/ComplianceCard';
import RecentAssessments from "./recentAssessments";

const Home = () => {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Governance Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive overview of your systems compliance and risk status.</p>
      </div>

      {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="High Risk AI Systems"
              value="12"
              icon={AlertTriangle}
              variant="danger"
            />
            <StatsCard
              title="Compliant Systems"
              value="89"
              icon={CheckCircle2}
              variant="success"
            />
            <StatsCard
              title="Under Review"
              value="23"
              icon={Clock}
              variant="warning"
            />
            <StatsCard
              title="Total AI Systems"
              value="124"
              icon={Database}
              variant="info"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Framework Compliance Overview</h2>
            <p className="text-muted-foreground mb-6">Track your organization's compliance with major AI governance frameworks</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ComplianceCard
                title="EU AI Act"
                description="European Union Artificial Intelligence Act compliance"
                progress={75}
                status="in-progress"
              />
              <ComplianceCard
                title="GDPR"
                description="General Data Protection Regulation"
                progress={100}
                status="compliant"
              />
              <ComplianceCard
                title="NIST AI Framework"
                description="National Institute of Standards and Technology"
                progress={45}
                status="assessment"
              />
              <ComplianceCard
                title="ISO 42001"
                description="Artificial Intelligence Management Systems"
                progress={0}
                status="not-started"
              />
            </div>
          </div>

          <RecentAssessments />
    </main>
  );
};

export default Home;
