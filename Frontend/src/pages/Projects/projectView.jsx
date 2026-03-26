import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import Comments from './components/comments';
import Overview from './components/overview';
import ProjectRisks from './components/projectRisks';
import Frameworks from './components/frameworks';
import Settings from './components/settings';
import Purpose from './components/purpose';

import { getProjectDetails } from '../../services/projectService';
import Workflows from './components/workflows';

const tabLabels = [
  "Overview",
  "Project risks",
  "Settings",
  "Purpose & Elements",
  "Comments",
  "Frameworks",
  "Workflows",
];

function TabPanel({ value, index, children }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProjectView = () => {
  const { projectId } = useParams();
  const token = localStorage.getItem('token');

  const [tab, setTab] = useState(0);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!token) {
        return;
      }
      try {
        setLoading(true);
        const data = await getProjectDetails(projectId, token);
        setProject(data);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, token]); // Add token to the dependency array

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
    );
  }

  return (
    <div>
      <Typography variant="h4" component="h1" fontWeight="bold">
        {project?.projectName || 'Project View'}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {project?.goal || 'This project includes all the governance process status.'}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          aria-label="project tabs"
          sx={{
            '& .MuiTab-root': { textTransform: 'none', minWidth: 120 },
            '& .Mui-selected': { color: '#10b981' }, // green-500
            '& .MuiTabs-indicator': { backgroundColor: '#10b981' }
          }}
        >
          {tabLabels.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <Overview project={project} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <ProjectRisks projectId={projectId} />
      </TabPanel>
      <TabPanel value={tab} index={5}>
        <Frameworks />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Settings project={project} />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Purpose projectId={projectId} />
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <Comments projectId={projectId}/>
      </TabPanel>
      <TabPanel value={tab} index={6}>
        <Workflows/>
      </TabPanel>
    </div>
  );
};

export default ProjectView;