import React, { useState, useEffect } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import governanceService from "../../../services/governanceService";

const Overview = ({ project }) => {
  const useCase = project?.template?.toLowerCase() || "";
  const isAiSystem = useCase.includes("ai");
  const isCyberSystem = useCase.includes("cybersecurity");

  // State for governance scores
  const [governanceScores, setGovernanceScores] = useState({
    eu_score: 0,
    nist_score: 0,
    iso_score: 0,
    overall_score: 0,
    implemented_controls_count: 0,
    total_controls_count: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchGovernanceScores = async () => {
      if (project?.projectId) {
        try {
          setLoading(true);
          const fetchedScores =
            await governanceService.getProjectGovernanceScores(
              project.projectId
            );
            console.log(fetchedScores)
          setGovernanceScores((prevState) => ({
            ...prevState,
            ...fetchedScores,
          }));
        } catch (error) {
          console.error("Error fetching governance scores:", error);
          // On error, the state will retain its default zero values
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGovernanceScores();
  }, [project?.projectId]);

  // AI-related data - now using real governance scores
  const euSubcontrols = {
    completed: governanceScores.implemented_controls_count,
    total: governanceScores.total_controls_count || 100,
  };
  const euAssessments = {
    completed: Math.round((governanceScores.eu_score / 100) * 70),
    total: 70,
  };
  const isoClauses = {
    completed: Math.round((governanceScores.iso_score / 100) * 24),
    total: 24,
  };
  const isoAnnexes = {
    completed: Math.round((governanceScores.iso_score / 100) * 37),
    total: 37,
  };

  // Cybersecurity-related data - using real governance scores
  const iso27001Controls = {
    completed: governanceScores.implemented_controls_count,
    total: governanceScores.total_controls_count || 114,
  };
  const iso27001Annexes = {
    completed: Math.round((governanceScores.iso_score / 100) * 14),
    total: 14,
  };

  // Helper to calculate percentage
  const percent = (completed, total) =>
    total > 0 ? Math.round((completed / total) * 100) : 0;

  // Helper to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* --- Info Cards (Dynamic) --- */}
      <div className="flex flex-wrap gap-6">
        <div className="flex gap-6">
          <div className="border border-gray-200 p-4 w-80 rounded-lg bg-white">
            <div className="text-gray-400 text-sm">Owner</div>
            <div className="font-semibold">{project?.owner?.name || "N/A"}</div>
          </div>
          <div className="border border-gray-200 p-4 w-80 rounded-lg bg-white">
            <div className="text-gray-400 text-sm">Created on</div>
            <div className="font-semibold">
              {formatDate(project?.createdAt)}
            </div>
          </div>
          <div className="border border-gray-200 p-4 w-80 rounded-lg bg-white">
            <div className="text-gray-400 text-sm">Last Updated on</div>
            <div className="font-semibold">
              {formatDate(project?.updatedAt)}
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-12">
          <div className="border border-gray-200 p-4 w-max rounded-lg bg-white">
            <div className="text-gray-400 text-sm">Goal</div>
            <div className="">
              {project?.projectName || "No goal specified."}
            </div>
          </div>
          <div className="border border-gray-200 p-4 w-80 rounded-lg bg-white">
            <div className="text-gray-400 text-sm">Team Members</div>
            <div className="">No additional members assigned</div>
          </div>
        </div>
      </div>

      {/* --- Governance Scores Section --- */}
      {!loading &&
        (governanceScores.overall_score > 0 ||
          governanceScores.total_controls_count > 0) && (
          <div className="border border-gray-300 p-4 rounded-lg bg-white">
            <div className="font-medium mb-4">Governance Assessment Scores</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {governanceService.formatScore(governanceScores.eu_score)}
                </div>
                <div className="text-sm text-gray-600">EU AI Act</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {governanceService.formatScore(governanceScores.nist_score)}
                </div>
                <div className="text-sm text-gray-600">NIST AI RMF</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {governanceService.formatScore(governanceScores.iso_score)}
                </div>
                <div className="text-sm text-gray-600">ISO 42001</div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: governanceService.getScoreColor(
                      governanceScores.overall_score
                    ),
                  }}
                >
                  {governanceService.formatScore(
                    governanceScores.overall_score
                  )}
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              {governanceScores.implemented_controls_count} of{" "}
              {governanceScores.total_controls_count} controls implemented (
              {governanceService.formatScore(
                governanceService.calculateCompliancePercentage(
                  governanceScores.implemented_controls_count,
                  governanceScores.total_controls_count
                )
              )}
              )
            </div>
          </div>
        )}

      {/* --- Completion Status (Now Conditional) --- */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Renders only if the project is an AI system */}
        {isAiSystem && (
          <>
            {/* EU AI Act */}
            <div className="flex-1">
              <div className="font-medium mb-2">
                EU AI Act Completion Status
              </div>
              <div className="border border-gray-300 p-4 rounded-lg bg-white flex flex-col gap-6">
                {/* Subcontrols */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <LinearProgress
                      variant="determinate"
                      value={percent(
                        euSubcontrols.completed,
                        euSubcontrols.total
                      )}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#f3f4f6",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#2563eb",
                        },
                      }}
                    />
                    <div className="text-sm mt-2 text-gray-700">
                      {euSubcontrols.completed} Subcontrols out of{" "}
                      {euSubcontrols.total} completed
                    </div>
                  </div>
                  <div className="w-12 text-right font-semibold">
                    {percent(euSubcontrols.completed, euSubcontrols.total)}%
                  </div>
                </div>
                {/* Assessments */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <LinearProgress
                      variant="determinate"
                      value={percent(
                        euAssessments.completed,
                        euAssessments.total
                      )}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#f3f4f6",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#10b981",
                        },
                      }}
                    />
                    <div className="text-sm mt-2 text-gray-700">
                      {euAssessments.completed} Assessments out of{" "}
                      {euAssessments.total} completed
                    </div>
                  </div>
                  <div className="w-12 text-right font-semibold">
                    {percent(euAssessments.completed, euAssessments.total)}%
                  </div>
                </div>
              </div>
            </div>

            {/* ISO 42001 */}
            <div className="flex-1">
              <div className="font-medium mb-2">
                ISO 42001 Completion Status
              </div>
              <div className="border border-gray-300 p-4 rounded-lg bg-white flex flex-col gap-6">
                {/* Clauses */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <LinearProgress
                      variant="determinate"
                      value={percent(isoClauses.completed, isoClauses.total)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#f3f4f6",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#f59e42",
                        },
                      }}
                    />
                    <div className="text-sm mt-2 text-gray-700">
                      {isoClauses.completed} Clauses out of {isoClauses.total}{" "}
                      completed
                    </div>
                  </div>
                  <div className="w-12 text-right font-semibold">
                    {percent(isoClauses.completed, isoClauses.total)}%
                  </div>
                </div>
                {/* Annexes */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <LinearProgress
                      variant="determinate"
                      value={percent(isoAnnexes.completed, isoAnnexes.total)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#f3f4f6",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#ef4444",
                        },
                      }}
                    />
                    <div className="text-sm mt-2 text-gray-700">
                      {isoAnnexes.completed} Annexes out of {isoAnnexes.total}{" "}
                      completed
                    </div>
                  </div>
                  <div className="w-12 text-right font-semibold">
                    {percent(isoAnnexes.completed, isoAnnexes.total)}%
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Renders only if the project is a Cybersecurity system */}
        {isCyberSystem && (
          <div className="flex-1">
            <div className="font-medium mb-2">ISO 27001 Completion Status</div>
            <div className="border border-gray-300 p-4 rounded-lg bg-white flex flex-col gap-6">
              {/* Controls */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <LinearProgress
                    variant="determinate"
                    value={percent(
                      iso27001Controls.completed,
                      iso27001Controls.total
                    )}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#f3f4f6",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#8b5cf6",
                      },
                    }}
                  />
                  <div className="text-sm mt-2 text-gray-700">
                    {iso27001Controls.completed} Controls out of{" "}
                    {iso27001Controls.total} completed
                  </div>
                </div>
                <div className="w-12 text-right font-semibold">
                  {percent(iso27001Controls.completed, iso27001Controls.total)}%
                </div>
              </div>
              {/* Annexes */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <LinearProgress
                    variant="determinate"
                    value={percent(
                      iso27001Annexes.completed,
                      iso27001Annexes.total
                    )}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#f3f4f6",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#d946ef",
                      },
                    }}
                  />
                  <div className="text-sm mt-2 text-gray-700">
                    {iso27001Annexes.completed} Annexes out of{" "}
                    {iso27001Annexes.total} completed
                  </div>
                </div>
                <div className="w-12 text-right font-semibold">
                  {percent(iso27001Annexes.completed, iso27001Annexes.total)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr />
    </div>
  );
};

export default Overview;
