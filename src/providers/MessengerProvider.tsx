"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { type GenericId as Id } from "convex/values";
import type { Profile } from "@/types/profile";


// ==================== TYPES ====================
interface MessengerState {
  // UI State
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  isNotificationPanelOpen: boolean;

  // Media & Upload State
  pendingUploads: PendingUpload[];
  recordingState: VoiceRecordingState | null;

  // Search
  searchQuery: string;
  searchResults: SearchResult[];

  // Notifications
  soundEnabled: boolean;
  lastNotificationSound: number;

  // Draft Management
  drafts: Record<string, MessageDraft>;
}

// Define a type for search results
interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  [key: string]: unknown;
}

export interface PendingUpload {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  preview?: string;
  conversationId: Id<"conversations">;
  waveform?: number[];
  duration?: number;
  storageId?: Id<"_storage">;
  isVoiceMessage: boolean;
}

interface VoiceRecordingState {
  isRecording: boolean;
  duration: number;
  audioUrl?: string;
  waveform: number[];
}

// Define a type for attachments
interface MessageAttachment {
  id: string;
  type: string;
  url?: string;
  name?: string;
  size?: number;
  [key: string]: unknown;
}

interface MessageDraft {
  content: string;
  replyToId?: Id<"messages">;
  attachments: MessageAttachment[];
  lastUpdated: number;
  mentions?: Id<"profiles">[];
  mentionsAll?: boolean;
}

type MessengerAction =
  | { type: "TOGGLE_SIDEBAR"; payload?: boolean }
  | { type: "TOGGLE_SEARCH"; payload?: boolean }
  | { type: "TOGGLE_NOTIFICATIONS"; payload?: boolean }
  | { type: "ADD_PENDING_UPLOAD"; payload: PendingUpload }
  | {
      type: "UPDATE_UPLOAD_PROGRESS";
      payload: { id: string; progress: number };
    }
  | { type: "REMOVE_UPLOAD"; payload: string }
  | { type: "START_RECORDING" }
  | { type: "STOP_RECORDING"; payload?: string }
  | { type: "UPDATE_RECORDING"; payload: Partial<VoiceRecordingState> }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SEARCH_RESULTS"; payload: SearchResult[] }
  | {
      type: "UPDATE_DRAFT";
      payload: { conversationId: string; draft: Partial<MessageDraft> };
    }
  | { type: "CLEAR_DRAFT"; payload: string }
  | { type: "TOGGLE_SOUND"; payload?: boolean };

// ==================== INITIAL STATE ====================
const initialState: MessengerState = {
  isSidebarOpen: false,
  isSearchOpen: false,
  isNotificationPanelOpen: false,
  pendingUploads: [],
  recordingState: null,
  searchQuery: "",
  searchResults: [],
  soundEnabled: true,
  lastNotificationSound: 0,
  drafts: {},
};

// ==================== REDUCER ====================
function messengerReducer(
  state: MessengerState,
  action: MessengerAction
): MessengerState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        isSidebarOpen: action.payload ?? !state.isSidebarOpen,
      };

    case "TOGGLE_SEARCH":
      return {
        ...state,
        isSearchOpen: action.payload ?? !state.isSearchOpen,
        searchQuery: action.payload === false ? "" : state.searchQuery,
        searchResults: action.payload === false ? [] : state.searchResults,
      };

    case "TOGGLE_NOTIFICATIONS":
      return {
        ...state,
        isNotificationPanelOpen:
          action.payload ?? !state.isNotificationPanelOpen,
      };

    case "ADD_PENDING_UPLOAD":
      // Check if upload with same ID exists and remove it first
      const existingUploadIndex = state.pendingUploads.findIndex(
        (upload) => upload.id === action.payload.id
      );

      if (existingUploadIndex !== -1) {
        // Replace existing upload with the same ID
        const updatedUploads = [...state.pendingUploads];
        updatedUploads[existingUploadIndex] = action.payload;

        return {
          ...state,
          pendingUploads: updatedUploads,
        };
      } else {
        // Add new upload if ID doesn't exist
        return {
          ...state,
          pendingUploads: [...state.pendingUploads, action.payload],
        };
      }

    case "UPDATE_UPLOAD_PROGRESS":
      return {
        ...state,
        pendingUploads: state.pendingUploads.map((upload) =>
          upload.id === action.payload.id
            ? { ...upload, progress: action.payload.progress }
            : upload
        ),
      };

    case "REMOVE_UPLOAD":
      return {
        ...state,
        pendingUploads: state.pendingUploads.filter(
          (upload) => upload.id !== action.payload
        ),
      };

    case "START_RECORDING":
      return {
        ...state,
        recordingState: {
          isRecording: true,
          duration: 0,
          waveform: [],
        },
      };

    case "STOP_RECORDING":
      return {
        ...state,
        recordingState: state.recordingState
          ? {
              ...state.recordingState,
              isRecording: false,
              audioUrl: action.payload,
            }
          : null,
      };

    case "UPDATE_RECORDING":
      return {
        ...state,
        recordingState: state.recordingState
          ? {
              ...state.recordingState,
              ...action.payload,
            }
          : null,
      };

    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      };

    case "SET_SEARCH_RESULTS":
      return {
        ...state,
        searchResults: action.payload,
      };

    case "UPDATE_DRAFT":
      const existingDraft = state.drafts[action.payload.conversationId];
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.payload.conversationId]: {
            content: existingDraft?.content || "",
            attachments: existingDraft?.attachments || [],
            ...action.payload.draft,
            lastUpdated: Date.now(),
          },
        },
      };

    case "CLEAR_DRAFT":
      // Create a new drafts object without the specified conversation
      const newDrafts = { ...state.drafts };
      delete newDrafts[action.payload];

      return {
        ...state,
        drafts: newDrafts,
      };

    case "TOGGLE_SOUND":
      return {
        ...state,
        soundEnabled: action.payload ?? !state.soundEnabled,
      };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface MessengerContextType {
  profile: Profile;
  state: MessengerState;
  dispatch: React.Dispatch<MessengerAction>;
  actions: {
    toggleSidebar: (open?: boolean) => void;
    toggleSearch: (open?: boolean) => void;
    toggleNotifications: (open?: boolean) => void;
    addPendingUpload: (upload: PendingUpload) => void;
    updateUploadProgress: (id: string, progress: number) => void;
    removeUpload: (id: string) => void;
    startRecording: () => void;
    stopRecording: (audioUrl?: string) => void;
    updateRecording: (updates: Partial<VoiceRecordingState>) => void;
    updateDraft: (conversationId: string, draft: Partial<MessageDraft>) => void;
    clearDraft: (conversationId: string) => void;
    search: (query: string) => void;
    toggleSound: (enabled?: boolean) => void;
    playNotificationSound: () => void;
  };
}

const MessengerContext = createContext<MessengerContextType | undefined>(
  undefined
);

// ==================== PROVIDER ====================
export const MessengerProvider: React.FC<{
  children: React.ReactNode;
  preloadedProfile: Preloaded<typeof api.profiles.queries.getProfile>;
}> = ({ children, preloadedProfile }) => {
  const profile = usePreloadedQuery(preloadedProfile);

  const [state, dispatch] = useReducer(messengerReducer, initialState);

  // Actions
  const actions = {
    search: () => {},
    toggleSidebar: useCallback((open?: boolean) => {
      dispatch({ type: "TOGGLE_SIDEBAR", payload: open });
    }, []),
    toggleSearch: useCallback((open?: boolean) => {
      dispatch({ type: "TOGGLE_SEARCH", payload: open });
    }, []),
    toggleNotifications: useCallback((open?: boolean) => {
      dispatch({ type: "TOGGLE_NOTIFICATIONS", payload: open });
    }, []),
    addPendingUpload: useCallback((upload: PendingUpload) => {
      dispatch({ type: "ADD_PENDING_UPLOAD", payload: upload });
    }, []),
    updateUploadProgress: useCallback((id: string, progress: number) => {
      dispatch({ type: "UPDATE_UPLOAD_PROGRESS", payload: { id, progress } });
    }, []),
    removeUpload: useCallback((id: string) => {
      dispatch({ type: "REMOVE_UPLOAD", payload: id });
    }, []),
    startRecording: useCallback(() => {
      dispatch({ type: "START_RECORDING" });
    }, []),
    stopRecording: useCallback((audioUrl?: string) => {
      dispatch({ type: "STOP_RECORDING", payload: audioUrl });
    }, []),
    updateRecording: useCallback((updates: Partial<VoiceRecordingState>) => {
      dispatch({ type: "UPDATE_RECORDING", payload: updates });
    }, []),
    updateDraft: useCallback(
      (conversationId: string, draft: Partial<MessageDraft>) => {
        dispatch({ type: "UPDATE_DRAFT", payload: { conversationId, draft } });
      },
      []
    ),
    clearDraft: useCallback((conversationId: string) => {
      dispatch({ type: "CLEAR_DRAFT", payload: conversationId });
    }, []),
    toggleSound: useCallback((enabled?: boolean) => {
      dispatch({ type: "TOGGLE_SOUND", payload: enabled });
    }, []),
    playNotificationSound: useCallback(() => {
      if (!state.soundEnabled) return;

      const now = Date.now();
      // Throttle notification sounds to once per second
      if (now - state.lastNotificationSound > 1000) {
        try {
          const audio = new Audio("/sounds/notification.mp3");
          audio.volume = 0.5;
          audio.play().catch(console.error);
          dispatch({ type: "TOGGLE_SOUND", payload: state.soundEnabled }); // Update last sound time
        } catch (error) {
          console.error("Failed to play notification sound:", error);
        }
      }
    }, [state.soundEnabled, state.lastNotificationSound]),
  };

  if (!profile) {
    return <div></div>;
  }

  return (
    <MessengerContext.Provider value={{ state, dispatch, actions, profile }}>
      {children}
    </MessengerContext.Provider>
  );
};

// ==================== HOOK ====================
export const useMessenger = (): MessengerContextType => {
  const context = useContext(MessengerContext);
  if (!context) {
    throw new Error("useMessenger must be used within MessengerProvider");
  }
  return context;
};

export default MessengerProvider;
