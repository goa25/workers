// i-Pledge Carbon Impact Platform: App Context
// Client-side state management with API integration

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { User, ActivitySubmission, AppNotification } from '../types';
import { enrollPledges, clearToken, setToken } from '../api';
import { PLEDGE_ID_MAP } from '../data/pledges';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  enrolledPledges: string[];
  submissions: ActivitySubmission[];
  notifications: AppNotification[];
  totalCO2Saved: number;
  currentMonth: string;
}

const INITIAL_STATE: AppState = {
  user: null, isAuthenticated: false, enrolledPledges: [],
  submissions: [], notifications: [], totalCO2Saved: 0, currentMonth: 'July 2026',
};

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ENROLL_PLEDGE'; payload: string }
  | { type: 'UNENROLL_PLEDGE'; payload: string }
  | { type: 'SUBMIT_ACTIVITY'; payload: ActivitySubmission }
  | { type: 'UPDATE_SUBMISSION_STATUS'; payload: { id: string; status: ActivitySubmission['status']; reviewerNotes?: string } }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'RESTORE_STATE'; payload: Partial<AppState> };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true, totalCO2Saved: action.payload.co2Saved };
    case 'LOGOUT':
      return { ...INITIAL_STATE };
    case 'ENROLL_PLEDGE': {
      if (state.enrolledPledges.includes(action.payload)) return state;
      return {
        ...state,
        enrolledPledges: [...state.enrolledPledges, action.payload],
        notifications: [{
          id: crypto.randomUUID(), type: 'success', title: 'Pledge enrolled!',
          message: 'You enrolled in a new pledge.', time: 'Just now', read: false,
        }, ...state.notifications],
      };
    }
    case 'UNENROLL_PLEDGE':
      return { ...state, enrolledPledges: state.enrolledPledges.filter(id => id !== action.payload) };
    case 'SUBMIT_ACTIVITY': {
      const subs = [action.payload, ...state.submissions];
      const co2 = subs.filter(s => s.status === 'verified').reduce((a, s) => a + s.co2Saved, 0)
        + subs.filter(s => s.status === 'pending').reduce((a, s) => a + s.co2Saved * 0.9, 0);
      return { ...state, submissions: subs, totalCO2Saved: Math.round(co2 * 10) / 10,
        user: state.user ? { ...state.user, co2Saved: Math.round(co2 * 10) / 10 } : null,
        notifications: [{ id: crypto.randomUUID(), type: 'info', title: 'Activity submitted',
          message: action.payload.pledgeTitle + ' submitted for review.', time: 'Just now', read: false,
        }, ...state.notifications] };
    }
    case 'UPDATE_SUBMISSION_STATUS': {
      const subs = state.submissions.map(s => s.id === action.payload.id
        ? { ...s, status: action.payload.status, reviewerNotes: action.payload.reviewerNotes, reviewedAt: new Date().toISOString() } : s);
      const co2 = subs.filter(s => s.status === 'verified').reduce((a, s) => a + s.co2Saved, 0);
      return { ...state, submissions: subs, totalCO2Saved: Math.round(co2 * 10) / 10,
        user: state.user ? { ...state.user, co2Saved: Math.round(co2 * 10) / 10 } : null,
        notifications: [{ id: crypto.randomUUID(),
          type: action.payload.status === 'verified' ? 'success' : action.payload.status === 'rejected' ? 'warning' : 'info',
          title: action.payload.status === 'verified' ? 'Activity verified!' : action.payload.status === 'rejected' ? 'Activity rejected' : 'Activity flagged',
          message: action.payload.reviewerNotes || 'Your submission status has been updated.',
          time: 'Just now', read: false,
        }, ...state.notifications] };
    }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 50) };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default: return state;
  }
}

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  dispatch: React.Dispatch<AppAction>;
  login: (user: User) => void;
  logout: () => void;
  enrollPledge: (pledgeId: string) => Promise<void>;
  unenrollPledge: (pledgeId: string) => void;
  submitActivity: (submission: ActivitySubmission) => void;
  updateSubmissionStatus: (id: string, status: ActivitySubmission['status'], reviewerNotes?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;
  isPledgeEnrolled: (pledgeId: string) => boolean;
  getSubmissionsForPledge: (pledgeId: string) => ActivitySubmission[];
  getSubmissionsByMonth: (month: string) => ActivitySubmission[];
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'i-pledge-app-state';

// pledgeId string -> numeric API id (single source of truth: data/pledges.ts)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  // False until the persisted session has been read back. Route guards must wait
  // for this, otherwise they redirect to /auth on the first render after a refresh.
  const [hydrated, setHydrated] = React.useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(stored) as Partial<AppState> });
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Never write before the first read. Without this guard the initial empty
    // state overwrites the saved session, and StrictMode's double-invoked
    // effects then read that blank value back — signing the user out on refresh.
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: state.user, isAuthenticated: state.isAuthenticated,
        enrolledPledges: state.enrolledPledges, submissions: state.submissions,
        notifications: state.notifications.slice(0, 20),
        totalCO2Saved: state.totalCO2Saved, currentMonth: state.currentMonth,
      }));
    } catch { /* ignore */ }
  }, [state, hydrated]);

  const login = useCallback((user: User) => dispatch({ type: 'LOGIN', payload: user }), []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem(STORAGE_KEY);
    clearToken();
  }, []);

  // enrollPledge calls the API then updates local state
  const enrollPledge = useCallback(async (pledgeId: string) => {
    const numericId = PLEDGE_ID_MAP[pledgeId];
    if (state.user?.id && numericId) {
      try {
        await enrollPledges({ userId: state.user.id, pledgeIds: [numericId] });
      } catch { /* silently continue; local state still updates */ }
    }
    dispatch({ type: 'ENROLL_PLEDGE', payload: pledgeId });
  }, [state.user]);

  const unenrollPledge = useCallback((id: string) => dispatch({ type: 'UNENROLL_PLEDGE', payload: id }), []);
  const submitActivity = useCallback((s: ActivitySubmission) => dispatch({ type: 'SUBMIT_ACTIVITY', payload: s }), []);
  const updateSubmissionStatus = useCallback((id: string, status: ActivitySubmission['status'], reviewerNotes?: string) =>
    dispatch({ type: 'UPDATE_SUBMISSION_STATUS', payload: { id, status, reviewerNotes } }), []);
  const markNotificationRead = useCallback((id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }), []);
  const markAllNotificationsRead = useCallback(() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }), []);

  const unreadNotificationCount = state.notifications.filter(n => !n.read).length;
  const isPledgeEnrolled = useCallback((id: string) => state.enrolledPledges.includes(id), [state.enrolledPledges]);
  const getSubmissionsForPledge = useCallback((id: string) => state.submissions.filter(s => s.pledgeId === id), [state.submissions]);
  const getSubmissionsByMonth = useCallback((month: string) => state.submissions.filter(s => s.month === month), [state.submissions]);

  return (
    <AppContext.Provider value={{ state, hydrated, dispatch, login, logout, enrollPledge, unenrollPledge, submitActivity,
      updateSubmissionStatus, markNotificationRead, markAllNotificationsRead,
      unreadNotificationCount, isPledgeEnrolled, getSubmissionsForPledge, getSubmissionsByMonth }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
