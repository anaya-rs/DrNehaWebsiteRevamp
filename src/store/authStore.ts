import { create } from 'zustand'

interface Admin {
  id: string
  email: string
  name: string
  firstLogin: boolean
}

interface AuthState {
  admin: Admin | null
  isLoading: boolean
  setAdmin: (admin: Admin | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isLoading: true,
  setAdmin: (admin) => set({ admin, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ admin: null, isLoading: false }),
}))
