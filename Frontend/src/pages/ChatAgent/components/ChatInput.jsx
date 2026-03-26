import React from 'react';
import { Paper, TextField, IconButton, Typography, CircularProgress } from '@mui/material';
import { Send } from '@mui/icons-material';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  onSendMessage, 
  isTyping, 
  isFinished, 
  inputRef 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Paper elevation={0} className="p-3 bg-white border-t border-gray-200 mt-3">
      <div className="flex items-end space-x-2">
        <TextField
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isFinished ? "Chat completed. Start a new session to continue." : "Type your answer here..."}
          multiline
          maxRows={3}
          disabled={isTyping || isFinished}
          className="flex-1"
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: '#e5e7eb',
              },
              '&:hover fieldset': {
                borderColor: '#d1d5db',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6366f1',
              },
            },
          }}
        />
        <IconButton
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isTyping || isFinished}
          className={`${
            !inputValue.trim() || isTyping || isFinished 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
          sx={{ 
            minWidth: 36, 
            height: 36,
            '&:disabled': {
              backgroundColor: '#f3f4f6',
              color: '#9ca3af'
            }
          }}
        >
          {isTyping ? <CircularProgress size={16} color="inherit" /> : <Send sx={{ fontSize: 16 }} />}
        </IconButton>
      </div>
      <Typography variant="caption" className="text-gray-400 mt-2 block text-center text-xs">
        {isFinished ? "Questionnaire completed successfully!" : "Press Enter to send, Shift+Enter for new line"}
      </Typography>
    </Paper>
  );
};

export default ChatInput; 