import React from 'react';
import { 
  Paper, 
  Typography, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Button
} from '@mui/material';
import { ExpandMore, Assessment, Security } from '@mui/icons-material';

const RiskAnalysisSection = ({ 
  showRiskAnalysis, 
  riskAnalysis, 
  parsedRiskTable, 
  onHideAnalysis 
}) => {
  if (!showRiskAnalysis || !riskAnalysis) return null;

  return (
    <Paper elevation={0} className="mb-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
      <Accordion defaultExpanded sx={{ boxShadow: 'none' }}>
        <AccordionSummary 
          expandIcon={<ExpandMore sx={{ fontSize: 20 }} />}
          sx={{ 
            '& .MuiAccordionSummary-content': {
              margin: '8px 0'
            }
          }}
        >
          <div className="flex items-center space-x-2">
            <Security className="text-indigo-600" sx={{ fontSize: 20 }} />
            <Typography variant="h6" className="text-indigo-800 font-semibold text-base">
              Risk Analysis Results
            </Typography>
            <Chip label="Complete" color="success" size="small" sx={{ fontSize: '0.75rem', height: 20 }} />
          </div>
        </AccordionSummary>
        <AccordionDetails className="pt-0">
          <div className="space-y-3">
            <Typography variant="body2" className="text-gray-600 text-sm">
              Based on your questionnaire responses, the following risks have been identified:
            </Typography>
            
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
              <Table size="small">
                <TableHead>
                  <TableRow className="bg-gray-50">
                    {parsedRiskTable[0]?.map((header, index) => (
                      <TableCell key={index} className="font-semibold text-xs text-gray-700 py-2">
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedRiskTable.slice(1).map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="text-xs py-2 text-gray-700">
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="flex space-x-2">
              <Button
                variant="contained"
                size="small"
                color="primary"
                startIcon={<Assessment sx={{ fontSize: 16 }} />}
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Export Report
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={onHideAnalysis}
                className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
              >
                Hide Analysis
              </Button>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default RiskAnalysisSection; 