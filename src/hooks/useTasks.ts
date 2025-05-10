
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, Task } from '@/services/taskService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function useTasks() {
  const { user } = useSupabaseAuth();
  
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: fetchTasks,
    enabled: !!user, // Only run the query when user is authenticated
  });

  return {
    tasks: tasks || [],
    isLoading,
    error,
  };
}
