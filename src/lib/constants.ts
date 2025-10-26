// Inquiry Module Constants

export const INQUIRY_STATUS = {
  NEW: 'NEW',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
} as const;

export const INQUIRY_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  RESOLVED: 'bg-green-100 text-green-800 border-green-300',
  REOPENED: 'bg-blue-100 text-blue-800 border-blue-300',
};

export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  RESOLVED: 'Resolved',
  REOPENED: 'Reopened',
};

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

export const VALIDATION_RULES = {
  NAME: {
    MIN: 2,
    MAX: 100,
  },
  SUBJECT: {
    MAX: 100,
  },
  MESSAGE: {
    MIN: 10,
    MAX: 2000,
  },
} as const;
