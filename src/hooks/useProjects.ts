
import { useQuery } from '@tanstack/react-query';
import { fetchProjects, Project } from '@/services/projectService';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function useProjects() {
  const { user } = useSupabaseAuth();
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => fetchProjects(),
    enabled: !!user, // Only run the query when user is authenticated
  });
  
  console.log("useProjects hook - User ID:", user?.id);
  console.log("useProjects hook - Projects count:", projects?.length || 0);
  
  return {
    projects: projects || [],
    isLoading,
    error,
  };
}
