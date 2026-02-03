/**
 * Error Logger Utility
 * Collects and stores application errors for debugging and support purposes
 */

import { APP_VERSION } from '../constants';

export interface ErrorLog {
  timestamp: string;
  message: string;
  context: string;
  error?: any;
}

// In-memory storage for error logs (max 100 entries to prevent memory issues)
const MAX_LOGS = 100;
let errorLogs: ErrorLog[] = [];

/**
 * Log an error with context information
 * @param message - Human-readable error message
 * @param context - Context where the error occurred (e.g., 'storage.saveTasks')
 * @param error - The actual error object (optional)
 */
export const logError = (message: string, context: string, error?: any): void => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    message,
    context,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
  };

  // Add to beginning of array (newest first)
  errorLogs.unshift(errorLog);

  // Keep only the most recent MAX_LOGS entries
  if (errorLogs.length > MAX_LOGS) {
    errorLogs = errorLogs.slice(0, MAX_LOGS);
  }

  // Still log to console for development
  console.error(`[${context}] ${message}`, error);
};

/**
 * Get all error logs
 * @returns Array of all error logs
 */
export const getErrorLogs = (): ErrorLog[] => {
  return [...errorLogs];
};

/**
 * Get count of error logs
 * @returns Number of error logs
 */
export const getErrorLogCount = (): number => {
  return errorLogs.length;
};

/**
 * Clear all error logs
 */
export const clearErrorLogs = (): void => {
  errorLogs = [];
};

/**
 * Export error logs as a formatted JSON string
 * @returns JSON string with error logs and metadata
 */
export const exportErrorLogs = (): string => {
  const exportData = {
    exportDate: new Date().toISOString(),
    appVersion: APP_VERSION,
    totalErrors: errorLogs.length,
    errors: errorLogs,
  };

  return JSON.stringify(exportData, null, 2);
};
