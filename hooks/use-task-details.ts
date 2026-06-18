"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useTaskPanel() {
  const queryClient = useQueryClient();

  // Read the current Task ID from the cache
  // using a unique key ["active-task-id"] to store this UI state
  const { data: activeTaskId } = useQuery({
    queryKey: ["active-task-id"],
    queryFn: () => null, 
    staleTime: Infinity, 
    gcTime: Infinity,    
  });

  const openTask = (id: string) => {
    console.log("Clickkkedd")
    queryClient.setQueryData(["active-task-id"], id);
  };

  const closeTask = () => {
    queryClient.setQueryData(["active-task-id"], null);
  };

  return {
    isOpen: !!activeTaskId,
    taskId: activeTaskId as string | null,
    openTask,
    closeTask,
  };
}