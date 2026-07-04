import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseHandler';
import { ENV } from '../config/env';
import fs from 'fs';
import path from 'path';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  try {
    const logFilePath = path.join(__dirname, '../../api_error_logs.txt');
    const logMessage = `
[${new Date().toISOString()}] ERROR: ${req.method} ${req.originalUrl} -> Status ${statusCode}
Message: ${message}
Headers: ${JSON.stringify(req.headers, null, 2)}
Body: ${JSON.stringify(req.body, null, 2)}
Stack: ${err.stack}
--------------------------------------------------------------------------------
`;
    fs.appendFileSync(logFilePath, logMessage);
  } catch (logErr) {
    console.error('Failed to write to api_error_logs.txt:', logErr);
  }

  // Clean up error object for production
  const errors = ENV.NODE_ENV === 'development' ? err.stack : undefined;

  errorResponse(res, statusCode, message, errors);
};
