import { authClient, type AuthUser } from "@/lib/authClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const queryClient = useQueryClient();
  const meQuery = useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: authClient.me,
    retry: false,
    staleTime: 30_000,
  });
  const logoutMutation = useMutation({
    mutationFn: authClient.logout,
    onSuccess: () => queryClient.setQueryData(["auth", "me"], null),
  });

  useEffect(() => {
    if (!redirectOnUnauthenticated || meQuery.isLoading || meQuery.data) return;
    window.location.href = redirectPath || "/auth";
  }, [redirectOnUnauthenticated, redirectPath, meQuery.isLoading, meQuery.data]);

  return {
    user: meQuery.data ?? null,
    loading: meQuery.isLoading || logoutMutation.isPending,
    error: meQuery.error ?? logoutMutation.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
    refresh: () => meQuery.refetch(),
    logout: async () => {
      await logoutMutation.mutateAsync();
      await meQuery.refetch();
    },
  };
}
