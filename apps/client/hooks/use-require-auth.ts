import { useSession } from "@repo/auth/client";
import { useAuthModalStore } from "store/auth-modal";

export function useRequireAuth() {
  const { data: session } = useSession();
  const openAuth = useAuthModalStore((s) => s.open);

  const requireAuth = <T extends unknown[]>(
    fn: (...args: T) => void,
  ): ((...args: T) => void) => {
    return (...args: T) => {
      if (!session?.user) {
        openAuth();
        return;
      }
      fn(...args);
    };
  };

  return { isLoggedIn: !!session?.user, requireAuth };
}
