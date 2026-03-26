// File: QuestionItem.jsx
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../contexts/AuthContext';

const QuestionItem = ({
  q,
  idx,
  onEdit,
  value,
  onChange
}) => {
  const { isAdmin } = useAuth();

  const handleCheckboxChange = (option) => (event) => {
    if (event.target.checked) {
      onChange([...(value || []), option]);
    } else {
      onChange((value || []).filter((v) => v !== option));
    }
  };

  const handleDateChange = (field) => (event) => {
    onChange({ ...value, [field]: event.target.value });
  };

  return (
    <Box key={q.id} mb={3} p={0} display="flex" alignItems="flex-start" gap={1}>
      <Box flex={1}>
        <Typography fontWeight={500} mb={1} sx={{ fontSize: '1.08rem' }}>
          {idx + 1}. {q.label}
        </Typography>
        {q.type === 'text-country' && (
          <Grid container spacing={2} mb={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full name"
                variant="outlined"
                fullWidth
                size="small"
                value={value?.name || ''}
                onChange={e => onChange({ ...value, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Select country</InputLabel>
                <Select
                  label="Select country"
                  value={value?.country || ''}
                  onChange={e => onChange({ ...value, country: e.target.value })}
                >
                  {q.fields?.[1]?.options?.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
        {q.type === 'text' && (
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
          />
        )}
        {q.type === 'textarea' && (
          <TextField
            placeholder={q.placeholder || ''}
            multiline
            minRows={2}
            fullWidth
            variant="outlined"
            size="small"
            margin="dense"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
          />
        )}
        {q.type === 'radio' && (
          <RadioGroup
            value={value || ''}
            onChange={e => onChange(e.target.value)}
          >
            {(q.options || []).map((opt, i) => (
              <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
        )}
        {q.type === 'checkbox' && (
          <FormGroup row>
            {(q.options || []).map((opt, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    checked={Array.isArray(value) ? value.includes(opt) : false}
                    onChange={handleCheckboxChange(opt)}
                  />
                }
                label={opt}
              />
            ))}
          </FormGroup>
        )}
        {q.type === 'date-range' && (
          <Grid container spacing={2} mb={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Desired Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                value={value?.start || ''}
                onChange={handleDateChange('start')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Target Completion Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                value={value?.end || ''}
                onChange={handleDateChange('end')}
              />
            </Grid>
          </Grid>
        )}
      </Box>
      {isAdmin() && (
        <IconButton size="small" onClick={() => onEdit(idx)} aria-label="edit question">
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default QuestionItem;
