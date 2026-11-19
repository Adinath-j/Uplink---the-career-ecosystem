import { create } from 'zustand';

export interface InAppAlert {
  id: string;
  type: 'MESSAGE' | 'NOTIFICATION';
  title: string;
  subtitle: string;
  avatarUrl?: string;
  timestamp: number;
  data?: any;
}

interface AlertState {
  activeAlert: InAppAlert | null;
  showAlert: (alert: Omit<InAppAlert, 'id' | 'timestamp'>) => void;
  dismissAlert: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useAlertStore = create<AlertState>((set) => ({
  activeAlert: null,

  showAlert: (alertData) => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }

    const alert: InAppAlert = {
      ...alertData,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };

    set({ activeAlert: alert });

    // Auto-dismiss after 4.5 seconds
    dismissTimer = setTimeout(() => {
      set({ activeAlert: null });
    }, 4500);
  },

  dismissAlert: () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    set({ activeAlert: null });
  },
}));
