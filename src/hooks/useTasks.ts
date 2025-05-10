
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, Task } from '@/services/taskService';

export function useTasks() {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  return {
    tasks: tasks || [],
    isLoading,
    error,
  };
}
