// OptionEditor.jsx
import { Button, TextField,IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack } from '@mui/material';

const OptionEditor = ({ options, onChange }) => {
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };
  const handleDelete = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onChange(newOptions);
  };

  return (
    <>
      {options.map((opt, i) => (
        <Stack direction="row" spacing={1} alignItems="center" key={i} mb={1}>
          <TextField
            label={`Option ${i + 1}`}
            fullWidth
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            margin="dense"
          />
          <IconButton aria-label="delete" onClick={() => handleDelete(i)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <Button
        onClick={() => {
          if (!options.includes('')) {
            onChange([...options, '']);
          }
        }}
      >
        Add Option
      </Button>

    </>
  );
};

export default OptionEditor;
