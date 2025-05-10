
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects, Project } from '@/services/projectService';

export function useProjects() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  return {
    projects: projects || [],
    isLoading,
    error,
  };
}
