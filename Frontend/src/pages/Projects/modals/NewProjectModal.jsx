import React, { useState, useEffect } from "react";
import {
  TextField, Select, MenuItem, Chip, InputLabel, FormControl,
  OutlinedInput, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Typography
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";

const owners = ["VerifyWise Admin"];
const regulations = ["ISO 42001", "EU AI Act"];
const teamMembers = ["Alice Smith", "John Doe", "VerifyWise Admin"];
const riskLevels = ["High risk", "Medium risk", "Low risk"];
const highRiskRoles = ["Deployer", "Developer", "Operator"];

const NewProjectModal = ({ open, onClose, onCreate, suggestFrom }) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [owner, setOwner] = useState(owners[0]);
  const [selectedRegulations, setSelectedRegulations] = useState([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [riskLevel, setRiskLevel] = useState(riskLevels[0]);
  const [highRiskRole, setHighRiskRole] = useState(highRiskRoles[0]);

  useEffect(() => {
    if (suggestFrom) {
      setProjectTitle(suggestFrom.title || "");
      setGoal(suggestFrom.goal || "");
      setOwner(suggestFrom.owner || owners[0]);
      setSelectedRegulations(suggestFrom.regulations || []);
      setStartDate(suggestFrom.startDate ? dayjs(suggestFrom.startDate) : dayjs());
      setSelectedMembers(suggestFrom.members || []);
      setRiskLevel(suggestFrom.riskLevel || riskLevels[0]);
      setHighRiskRole(suggestFrom.highRiskRole || highRiskRoles[0]);
    }
  }, [suggestFrom]);

  const handleCreate = () => {
    onCreate && onCreate({
      title: projectTitle,
      goal,
      owner,
      regulations: selectedRegulations,
      startDate: startDate.format("YYYY-MM-DD"),
      members: selectedMembers,
      riskLevel,
      highRiskRole
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" fontWeight="bold">Create New Project</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: theme => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Project title *"
          value={projectTitle}
          onChange={e => setProjectTitle(e.target.value)}
          fullWidth
        />

        <TextField
          label="Goal *"
          value={goal}
          onChange={e => setGoal(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        {/* Owner + Start Date */}
        <Box sx={{ display: 'flex', flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Owner *</InputLabel>
            <Select value={owner} onChange={e => setOwner(e.target.value)} label="Owner *">
              {owners.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start date *"
              value={startDate}
              onChange={setStartDate}
              format="MM/DD/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: <CalendarTodayIcon fontSize="small" className="mr-2" />
                  }
                }
              }}
            />
          </LocalizationProvider>
        </Box>

        {/* Regulations */}
        <FormControl fullWidth>
          <InputLabel>Monitored regulations and standards *</InputLabel>
          <Select
            multiple
            value={selectedRegulations}
            onChange={e => setSelectedRegulations(e.target.value)}
            input={<OutlinedInput label="Monitored regulations and standards *" />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map(value => <Chip key={value} label={value} />)}
              </Box>
            )}
          >
            {regulations.map(reg => <MenuItem key={reg} value={reg}>{reg}</MenuItem>)}
          </Select>
          <Typography variant="caption" color="text.secondary">
            Add all monitored regulations and standards of the project.
          </Typography>
        </FormControl>

        {/* Team Members */}
        <FormControl fullWidth>
          <InputLabel>Team members *</InputLabel>
          <Select
            multiple
            value={selectedMembers}
            onChange={e => setSelectedMembers(e.target.value)}
            input={<OutlinedInput label="Team members *" />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selected.map(value => <Chip key={value} label={value} />)}
              </Box>
            )}
          >
            {teamMembers.map(member => <MenuItem key={member} value={member}>{member}</MenuItem>)}
          </Select>
          <Typography variant="caption" color="text.secondary">
            Add all team members of the project. Only those who are added will be able to see the project.
          </Typography>
        </FormControl>

        {/* Risk Level + High Risk Role */}
        <Box sx={{ display: 'flex', flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Risk level *</InputLabel>
            <Select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} label="Risk level *">
              {riskLevels.map(level => <MenuItem key={level} value={level}>{level}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>High risk role *</InputLabel>
            <Select value={highRiskRole} onChange={e => setHighRiskRole(e.target.value)} label="High risk role *">
              {highRiskRoles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "grey.50", px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!projectTitle || !goal || selectedMembers.length === 0}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewProjectModal;
