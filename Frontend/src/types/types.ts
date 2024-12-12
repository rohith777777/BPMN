// Define your notification state type
export interface NotificationType {
  open: boolean;
  severity: 'error' | 'warning' | 'info' | 'success'; // Use AlertColor here
  message: string;
}
