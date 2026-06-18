import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAdminStore = create(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,

      login: (admin, token) => {
        localStorage.setItem("admin_token", token);
        set({ admin, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("admin_token");
        set({ admin: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "tradex-admin-auth",
      partialize: (s) => ({ admin: s.admin, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAdminStore;