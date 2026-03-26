import { format } from 'date-fns';

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log the incoming request
  console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${req.method} ${req.path} - ${req.ip}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields from logging
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    if (sanitizedBody.questionnaireResponses) {
      // Log questionnaire submission but not the full responses
      sanitizedBody.questionnaireResponses = '[QUESTIONNAIRE_DATA]';
    }
    
    console.log(`Request Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
    const resetColor = '\x1b[0m';
    
    console.log(`${statusColor}[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${req.method} ${req.path} - ${status} - ${duration}ms${resetColor}`);
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  console.error(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ERROR: ${req.method} ${req.path}`);
  console.error('Error details:', err);
  next(err);
}; 