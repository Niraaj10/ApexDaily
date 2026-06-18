import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  const { data: session, status } = useSession();

  // using TanStack Query to sync the session state with a key
  const userQuery = useQuery({
    queryKey: ["user-session"],
    queryFn: () => session?.user,
    enabled: !!session,
    staleTime: 1000 * 60 * 60, 
  });

  return {
    user: userQuery.data,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}