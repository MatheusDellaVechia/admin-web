export enum LogType {
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_FAILED = 'EMAIL_FAILED',
}

export interface LogEntry {
  id: string;
  type: LogType;
  orderId: string;
  performedBy: string;
  result: 'SUCCESS' | 'FAILURE';
  timestamp: string;
  recipientEmail?: string;
  details?: string;
}

export interface LogListResponse {
  logs: LogEntry[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
