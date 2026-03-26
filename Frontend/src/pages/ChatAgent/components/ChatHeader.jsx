import React from 'react';
import { Paper, Avatar, Typography, Button } from '@mui/material';
import { SmartToy, Refresh } from '@mui/icons-material';

const ChatHeader = ({ isFinished, isTyping, onResetChat }) => {
  return (
    <Paper elevation={0} className="p-3 bg-white border-b border-gray-200 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="bg-indigo-600" sx={{ width: 36, height: 36 }}>
            <SmartToy sx={{ fontSize: 20 }} />
          </Avatar>
          <div>
            <Typography variant="h6" className="font-semibold text-gray-800 text-lg">
              AI Governance Assistant
            </Typography>
            <Typography variant="body2" className="text-gray-500 text-sm">
              {isFinished ? 'Questionnaire Complete' : 'Answer questions to proceed'}
            </Typography>
          </div>
        </div>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh sx={{ fontSize: 16 }} />}
          onClick={onResetChat}
          disabled={isTyping}
          className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
        >
          New Chat
        </Button>
      </div>
    </Paper>
  );
};

export default ChatHeader; 