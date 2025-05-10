
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import ProjectCard from "@/components/projects/ProjectCard";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { createProject } from "@/services/projectService";
import { fetchTasks } from "@/services/taskService";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useProjects } from "@/hooks/useProjects";

const Projects = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated, isLoading: authLoading, user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  
  // Use the useProjects hook for data isolation
  const { projects, isLoading: projectsLoading } = useProjects();
  
  console.log("Projects page - Current user ID:", user?.id); // Debug log
  console.log("Projects page - Projects count:", projects?.length); // Debug log

  // Fetch tasks (for team member estimation)
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: isAuthenticated,
  });
  
  // Project mutations
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Project created successfully!");
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    },
  });
  
  const handleCreateProject = (newProject: any) => {
    createProjectMutation.mutate({
      name: newProject.name,
      description: newProject.description,
      start_date: newProject.startDate,
      due_date: newProject.dueDate,
      priority: newProject.priority,
      tags: newProject.tags,
    });
  };
  
  // Helper function to get team members based on project tasks
  const getProjectTeamMembers = (projectId: string) => {
    if (!tasks) return [];
    
    // In a real app, you'd have user assignments
    // For now, let's create mock team members based on number of tasks
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const taskCount = projectTasks.length;
    
    // Generate some mock team members
    const members = [];
    const names = ["John D.", "Sarah M.", "Alex K.", "Emma S.", "David L.", "Lisa R.", "Michael P.", "Nicole F."];
    
    // For demo purposes, assign more members to projects with more tasks
    const memberCount = Math.min(Math.ceil(taskCount / 2), 5);
    for (let i = 0; i < memberCount; i++) {
      if (i < names.length) {
        members.push(names[i]);
      }
    }
    
    return members;
  };
  
  // Get task counts for each project
  const getProjectTaskCounts = (projectId: string) => {
    if (!tasks) return { total: 0, completed: 0 };
    
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const completed = projectTasks.filter(task => task.status === "Completed").length;
    
    return {
      total: projectTasks.length,
      completed
    };
  };

  if (authLoading || projectsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">Loading projects...</h2>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 h-full items-center justify-center">
        <h2 className="text-2xl font-semibold">Please log in to view your projects</h2>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track your project portfolio</p>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      
      {projects && projects.length > 0 ? (
        <div className="grid gap-6">
          {projects.map((project) => {
            const team = getProjectTeamMembers(project.id);
            const taskCount = getProjectTaskCounts(project.id);
            
            return (
              <ProjectCard 
                key={project.id}
                project={project}
                teamMembers={team}
                taskCount={taskCount}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Get started by creating your first project to organize your tasks.
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button>
        </div>
      )}
      
      {/* Project creation modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <CreateProjectModal 
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateProject}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
