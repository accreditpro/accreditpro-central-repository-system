import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  notificationPanelOpen: boolean;
  notifications: Notification[];
  selectedAcademicYear: string;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  notificationPanelOpen: false,
  selectedAcademicYear: '2025-26',
  notifications: [
    {
      id: '1',
      title: 'Welcome to AccreditPro',
      message: 'Your institutional repository platform is ready.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'NAAC Submission Due',
      message: 'Annual quality assurance report deadline approaching.',
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'New Document Uploaded',
      message: 'Faculty research paper has been submitted for review.',
      type: 'success',
      read: true,
      createdAt: new Date().toISOString(),
    },
  ],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
    setNotificationPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationPanelOpen = action.payload;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) notification.read = true;
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
    },
    setSelectedAcademicYear: (state, action: PayloadAction<string>) => {
      state.selectedAcademicYear = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleNotificationPanel,
  setNotificationPanelOpen,
  markNotificationRead,
  markAllNotificationsRead,
  addNotification,
  setSelectedAcademicYear,
} = uiSlice.actions;
export default uiSlice.reducer;
