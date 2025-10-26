import { create } from "zustand";

type errorTypes = "success" | "warning" | "error";

interface ErrorData {
  message: string
  type: errorTypes
}

interface ErrorProps {
    errorData: ErrorData | null
    showError: (message: string, type: errorTypes) => void
    clearError: () => void  
}


export const useErrorStore = create<ErrorProps>((set) => ({
    errorData: null,
    showError: (message, type = 'error') => set({ errorData: { message, type } }),
    clearError: () => set({ errorData: null })
}))