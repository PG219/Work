import React, { useState, useEffect } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import riskMatrixService from "../../../services/riskMatrixService";
import AddRiskModal from "../modals/RiskModal";

const ProjectRisks = ({ projectId }) => {
  const [risks, setRisks] = useState([]);
  const [riskSummary, setRiskSummary] = useState([
    { label: "Very High", color: "red", count: 0 },
    { label: "High", color: "orange", count: 0 },
    { label: "Medium", color: "amber", count: 0 },
    { label: "Low", color: "green", count: 0 },
    { label: "Very Low", color: "teal", count: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectRisks();
    }
  }, [projectId]);

  const fetchProjectRisks = async () => {
    try {
      setLoading(true);
      const response = await riskMatrixService.getRisksByProject(projectId);
      const projectRisks = response.risks || [];

      // Update risks data
      setRisks(
        projectRisks.map((risk) => ({
          id: risk.riskAssessmentId,
          name: risk.riskName || "Risk Assessment",
          owner: risk.riskOwner || "Unknown",
          severity: risk.severity,
          likelihood: "Possible", // Default value
          mitigation: risk.mitigation || "No mitigation specified",
          status: risk.isActive ? "Active" : "Inactive",
          riskLevel: getRiskLevelFromSeverity(risk.severity),
          riskLevelColor: getRiskLevelColor(
            getRiskLevelFromSeverity(risk.severity)
          ),
          targetDate: risk.targetDate
            ? new Date(risk.targetDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "No target date",
          justification: risk.justification || "No justification provided",
        }))
      );

      // Calculate risk summary
      const summary = calculateRiskSummary(projectRisks);
      setRiskSummary(summary);
    } catch (error) {
      console.error("Error fetching project risks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelFromSeverity = (severity) => {
    switch (severity) {
      case 5:
        return "Critical Risk";
      case 4:
        return "High Risk";
      case 3:
        return "Medium Risk";
      case 2:
        return "Low Risk";
      case 1:
        return "Very Low Risk";
      default:
        return "Medium Risk";
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "Critical Risk":
        return "bg-red-400 text-red-900";
      case "High Risk":
        return "bg-orange-400 text-orange-900";
      case "Medium Risk":
        return "bg-amber-400 text-amber-900";
      case "Low Risk":
        return "bg-green-400 text-green-900";
      case "Very Low Risk":
        return "bg-teal-400 text-teal-900";
      default:
        return "bg-amber-400 text-amber-900";
    }
  };

  const calculateRiskSummary = (projectRisks) => {
    const summary = [
      { label: "Very High", color: "red", count: 0 },
      { label: "High", color: "orange", count: 0 },
      { label: "Medium", color: "amber", count: 0 },
      { label: "Low", color: "green", count: 0 },
      { label: "Very Low", color: "teal", count: 0 },
    ];

    projectRisks.forEach((risk) => {
      const severity = risk.severity;
      if (severity === 5) summary[0].count++;
      else if (severity === 4) summary[1].count++;
      else if (severity === 3) summary[2].count++;
      else if (severity === 2) summary[3].count++;
      else if (severity === 1) summary[4].count++;
    });

    return summary;
  };

  // Handle risk add from modal
  const handleAddRisk = async (newRisk) => {
    try {
      await riskMatrixService.addRisk(projectId, newRisk);
      fetchProjectRisks();
    } catch (err) {
      console.error("Error adding new risk:", err);
    }
  };

  return (
    <div className="p-8">
      {/* Risk Summary Bar */}
      <div className="border border-gray-200 rounded-lg px-8 py-4 mb-8 bg-white flex justify-between items-center max-w-4xl mx-auto">
        {riskSummary.map((risk) => (
          <div key={risk.label} className="flex flex-col items-center flex-1">
            <div className={`font-medium text-${risk.color}-500`}>
              {risk.label}
            </div>
            <div className={`text-2xl font-bold text-${risk.color}-800`}>
              {risk.count}
            </div>
          </div>
        ))}
      </div>

      {/* Header and Add Risk Modal */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">Project risks</div>
        <AddRiskModal onAddRisk={handleAddRisk} />
      </div>

      {/* Risks Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-gray-500 font-medium">RISK ID</th>
              <th className="px-4 py-3 text-gray-500 font-medium">RISK NAME</th>
              <th className="px-4 py-3 text-gray-500 font-medium">OWNER</th>
              <th className="px-4 py-3 text-gray-500 font-medium">SEVERITY</th>
              <th className="px-4 py-3 text-gray-500 font-medium">MITIGATION</th>
              <th className="px-4 py-3 text-gray-500 font-medium">STATUS</th>
              <th className="px-4 py-3 text-gray-500 font-medium">RISK LEVEL</th>
              <th className="px-4 py-3 text-gray-500 font-medium">TARGET DATE</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  Loading project risks...
                </td>
              </tr>
            ) : risks.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  No risks found for this project.
                </td>
              </tr>
            ) : (
              risks.map((risk, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{risk.id}</td>
                  <td className="px-4 py-3 font-medium">{risk.name}</td>
                  <td className="px-4 py-3">{risk.owner}</td>
                  <td className="px-4 py-3">{risk.severity}</td>
                  <td
                    className="px-4 py-3 max-w-xs truncate"
                    title={risk.mitigation}
                  >
                    {risk.mitigation}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {risk.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded font-semibold ${risk.riskLevelColor}`}
                    >
                      {risk.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">{risk.targetDate}</td>
                  <td className="px-4 py-3">
                    <SettingsIcon className="text-gray-400 cursor-pointer" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Table Footer */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 bg-gray-50 rounded-b-lg">
          <div>
            {loading
              ? "Loading..."
              : `Showing 1 - ${risks.length} of ${risks.length} project risk(s)`}
          </div>
          <div className="flex items-center gap-2">
            <span>Project risks per page</span>
            <select className="border rounded px-2 py-1">
              <option>5</option>
              <option>10</option>
              <option>15</option>
            </select>
            <span>Page 1 of 1</span>
            <button disabled className="text-gray-300 px-1">
              &lt;&lt;
            </button>
            <button disabled className="text-gray-300 px-1">
              &lt;
            </button>
            <button disabled className="text-gray-300 px-1">
              &gt;
            </button>
            <button disabled className="text-gray-300 px-1">
              &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectRisks;
