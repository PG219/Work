import React from 'react';
import { Paper, Avatar, Typography, CircularProgress } from '@mui/material';
import { SmartToy, Person, Security } from '@mui/icons-material';

const ChatMessages = ({ 
  messages, 
  isTyping, 
  isAnalyzingRisks, 
  messagesEndRef 
}) => {
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 rounded-lg">
      {messages.length === 0 && !isTyping && (
        <div className="text-center text-gray-500 py-6">
          <SmartToy sx={{ fontSize: 36, color: 'gray' }} />
          <Typography variant="h6" className="mt-2 text-lg">
            Welcome to AI Governance Assistant
          </Typography>
          <Typography variant="body2" className="text-sm">
            I'll guide you through the governance questionnaire
          </Typography>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex max-w-[75%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <Avatar 
              className={`${message.sender === 'user' ? 'ml-2 bg-emerald-600' : 'mr-2 bg-indigo-600'}`}
              sx={{ width: 28, height: 28 }}
            >
              {message.sender === 'user' ? <Person sx={{ fontSize: 16 }} /> : <SmartToy sx={{ fontSize: 16 }} />}
            </Avatar>
            <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <Paper 
                elevation={0}
                className={`px-3 py-2 rounded-xl border ${
                  message.sender === 'user' 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : message.isError
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : message.isSummary
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : message.isRiskAnalysis
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                <Typography 
                  variant="body2" 
                  className={`whitespace-pre-wrap text-sm leading-relaxed ${
                    message.isSummary ? 'font-mono text-xs' : ''
                  }`}
                >
                  {message.text}
                </Typography>
              </Paper>
              <Typography 
                variant="caption" 
                className={`mt-1 text-xs text-gray-400 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </div>
          </div>
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="flex max-w-[75%]">
            <Avatar className="mr-2 bg-indigo-600" sx={{ width: 28, height: 28 }}>
              <SmartToy sx={{ fontSize: 16 }} />
            </Avatar>
            <div className="flex flex-col">
              <Paper elevation={0} className="px-3 py-2 rounded-xl bg-white border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </Paper>
            </div>
          </div>
        </div>
      )}

      {/* Risk Analysis Loading */}
      {isAnalyzingRisks && (
        <div className="flex justify-start">
          <div className="flex max-w-[75%]">
            <Avatar className="mr-2 bg-violet-600" sx={{ width: 28, height: 28 }}>
              <Security sx={{ fontSize: 16 }} />
            </Avatar>
            <div className="flex flex-col">
              <Paper elevation={0} className="px-3 py-2 rounded-xl bg-violet-50 border border-violet-200">
                <div className="flex items-center space-x-2">
                  <CircularProgress size={14} className="text-violet-600" />
                  <Typography variant="body2" className="text-violet-700 text-sm">
                    Analyzing risks based on your responses...
                  </Typography>
                </div>
              </Paper>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages; 