import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  TextField,
  Button,
  MenuItem,
  Select,
  OutlinedInput,
  Chip
} from "@mui/material";
import { useState } from "react";

// Styled Dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "20px",
    padding: theme.spacing(2),
    backgroundColor: "white",
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
  },
  "& .MuiBackdrop-root": {
    backdropFilter: "blur(6px)",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
}));

// Dropdown options
const typeOptions = ["Vendor", "Partner", "Service Provider"];
const roleOptions = ["Data Processor", "Data Controller", "Consultant"];
const industryOptions = ["Finance", "Healthcare", "Technology", "Retail"];

export default function ThirdPartyModal({
  open,
  onClose,
  onSave,
  loading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    role: [],
    website: "",
    industry: [],
    description: "",
    notes: "",
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAdd = () => {
    onSave(formData);
    setFormData({
      name: "",
      type: "",
      role: [],
      website: "",
      industry: [],
      description: "",
      notes: "",
    });
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
        Add Third Party
      </DialogTitle>

      <DialogContent dividers sx={{ paddingTop: 2, backgroundColor: "", borderRadius: 3 }}>
        <div className="flex gap-6">

            
          {/* Left Side Fields */}
          <div className="w-1/2 flex flex-col gap-4 bg-white p-4 rounded-xl">

          <div className="font-bold text-xl">
            General Information
          </div>
            <div>
              <div className="font-medium mb-1">Name of Third Party</div>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={formData.name}
                onChange={handleChange("name")}
              />
            </div>

            <div>
              <div className="font-medium mb-1">Type</div>
              <Select
                fullWidth
                size="small"
                value={formData.type}
                onChange={handleChange("type")}
              >
                {typeOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <div>
              <div className="font-medium mb-1">Role</div>
              <Select
                multiple
                fullWidth
                size="small"
                value={formData.role}
                onChange={handleChange("role")}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </div>
                )}
              >
                {roleOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <div>
              <div className="font-medium mb-1">Website URL</div>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={formData.website}
                onChange={handleChange("website")}
              />
            </div>

            <div>
              <div className="font-medium mb-1">Industry Sector</div>
              <Select
                multiple
                fullWidth
                size="small"
                value={formData.industry}
                onChange={handleChange("industry")}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </div>
                )}
              >
                {industryOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Right Side Fields */}
          <div className="w-1/2 bg-white p-4 rounded-xl flex flex-col gap-4">
          <div className="font-bold">
            Additional Information
          </div>
            <div>
              <div className="font-medium mb-1">Description</div>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                size="small"
                value={formData.description}
                onChange={handleChange("description")}
              />
            </div>

            <div>
              <div className="font-medium mb-1">Notes</div>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                size="small"
                value={formData.notes}
                onChange={handleChange("notes")}
              />
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button onClick={onClose} sx={{ textTransform: "none", color: "#6b7280" }}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: "#2563eb",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: 600,
            px: 3,
            "&:hover": { backgroundColor: "#1e4fd1" },
          }}
        >
          {loading ? "Saving..." : "Add"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
