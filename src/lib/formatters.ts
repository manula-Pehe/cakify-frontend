import { InquiryStatus } from '@/types/inquiry';
import { INQUIRY_STATUS_COLORS, INQUIRY_STATUS_LABELS } from './constants';

/** Format date to readable string */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/** Format date to relative time (e.g., "2 hours ago") */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const minutes = Math.round(diff / (1000 * 60));
  if (minutes < 60) return rtf.format(-minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');

  const days = Math.round(hours / 24);
  if (days < 30) return rtf.format(-days, 'day');

  const months = Math.round(days / 30);
  if (months < 12) return rtf.format(-months, 'month');

  const years = Math.round(months / 12);
  return rtf.format(-years, 'year');
};

/** Get status badge color classes */
export const getStatusColor = (status: InquiryStatus): string => {
  return INQUIRY_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

/** Get status label */
export const getStatusLabel = (status: InquiryStatus): string => {
  return INQUIRY_STATUS_LABELS[status] || status;
};

/** Format file size */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/** Format hours to readable string */
export const formatHours = (hours: number): string => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  if (hours < 24) return `${Math.round(hours * 10) / 10} hrs`;
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  return `${days}d ${remHours}h`;
};

/** Format percentage */
export const formatPercentage = (value: number): string => `${value.toFixed(1)}%`;

/** Truncate text with ellipsis */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
