
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, Task } from '@/services/taskService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function useTasks() {
  const { user } = useSupabaseAuth();
  
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: () => fetchTasks(),
    enabled: !!user, // Only run the query when user is authenticated
  });
  
  console.log("useTasks hook - User ID:", user?.id);
  console.log("useTasks hook - Tasks count:", tasks?.length || 0);
  
  return {
    tasks: tasks || [],
    isLoading,
    error,
  };
}
