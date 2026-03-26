import Button from '@mui/material/Button';
import AddCircleOutlineSharpIcon from '@mui/icons-material/AddCircleOutlineSharp';
import LinearProgress from '@mui/material/LinearProgress';
import { useNavigate } from 'react-router-dom';
import NewProjectModal from './modals/NewProjectModal';
import { useState } from 'react';

const Projects = () => {
    const navigate = useNavigate();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [projects, setProjects] = useState([
      {
        title: 'AI Compliance Checker',
        tags: ['EU AI Act', 'ISO 42001'],
        subcontrols: 27,
        totalSubcontrols: 100,
        assessments: 20,
        totalAssessments: 70,
        clauses: 2,
        totalClauses: 24,
        annexes: 4,
        totalAnnexes: 37,
        owner: 'VerifyWise Admin',
        lastUpdated: '24 June 2025',
      },
    ]);

    const handleCreateProject = (project) => {
      setProjects([
        ...projects,
        {
          ...project,
          tags: project.regulations,
          subcontrols: 0,
          totalSubcontrols: 100,
          assessments: 0,
          totalAssessments: 70,
          clauses: 0,
          totalClauses: 24,
          annexes: 0,
          totalAnnexes: 37,
          owner: project.owner,
          lastUpdated: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        },
      ]);
      setShowNewProjectModal(false);
    };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-semibold">Projects Overview</div>
        <Button variant="outlined" startIcon={<AddCircleOutlineSharpIcon />} onClick={() => setShowNewProjectModal(true)}>
          <span className="px-2 py-1">New Project</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Card */}
        {projects.map((project, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow p-6">
            <div className="text-base font-semibold mb-3">{project.title}</div>
            {/* Tags */}
            <div className="flex gap-2 mb-4">
              {project.tags.map((tag, i) => (
                <span key={i} className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded">{tag}</span>
              ))}
            </div>
            {/* Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Subcontrols */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Subcontrols: {project.subcontrols} out of {project.totalSubcontrols}</span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={(project.subcontrols / project.totalSubcontrols) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#fbbf24' },
                  }}
                />
              </div>
              {/* Assessments */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Assessments: {project.assessments} out of {project.totalAssessments}</span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={(project.assessments / project.totalAssessments) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#a3a3a3' },
                  }}
                />
              </div>
              {/* Clauses */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Clauses: {project.clauses} out of {project.totalClauses}</span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={(project.clauses / project.totalClauses) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#fb7185' },
                  }}
                />
              </div>
              {/* Annexes */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Annexes: {project.annexes} out of {project.totalAnnexes}</span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={(project.annexes / project.totalAnnexes) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#f3f4f6',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#f87171' },
                  }}
                />
              </div>
            </div>
            {/* Project Metadata */}
            <div className="flex justify-between items-center text-sm mb-4">
              <div>
                <div className="text-gray-500">Project owner</div>
                <div className="font-medium">{project.owner}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Last updated</div>
                <div className="font-medium">{project.lastUpdated}</div>
              </div>
            </div>
            <Button variant="outlined" onClick={() => {navigate('/project-view/507f1f77bcf86cd799439011')}} fullWidth>
              View project
            </Button>
          </div>
        ))}
      </div>
      <NewProjectModal open={showNewProjectModal} onClose={() => setShowNewProjectModal(false)} onCreate={handleCreateProject} />
    </div>
  );
};

export default Projects;
