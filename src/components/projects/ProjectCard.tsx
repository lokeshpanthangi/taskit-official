
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash, MoreHorizontal, ExternalLink } from "lucide-react";
import { Project, deleteProject } from "@/services/projectService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import EditProjectModal from "./EditProjectModal";

interface ProjectCardProps {
  project: Project;
  teamMembers?: string[];
  taskCount?: { total: number; completed: number };
}

const ProjectCard = ({ project, teamMembers = [], taskCount }: ProjectCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    },
  });

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate(project.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card 
        className="overflow-hidden gradient-border bg-card hover:shadow-neon-blue-glow transition-shadow cursor-pointer"
        onClick={(e) => {
          // Prevent navigation if clicking on dropdown or buttons
          if (!(e.target as HTMLElement).closest('.dropdown-trigger')) {
            navigate(`/projects/${project.id}`);
          }
        }}
      >
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {project.description}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="dropdown-trigger">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium mb-2">Progress</h3>
              <div className="flex items-center space-x-2">
                {/* Calculate progress based on completed tasks */}
                {taskCount && taskCount.total > 0 ? (
                  <>
                    <Progress value={Math.round((taskCount.completed / taskCount.total) * 100)} className="h-2" />
                    <span className="text-sm font-medium">{Math.round((taskCount.completed / taskCount.total) * 100)}%</span>
                  </>
                ) : (
                  <>
                    <Progress value={0} className="h-2" />
                    <span className="text-sm font-medium">0%</span>
                  </>
                )}
              </div>
              <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
                <span>
                  {taskCount
                    ? `${taskCount.completed}/${taskCount.total} tasks completed`
                    : "0/0 tasks completed"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Team</h3>
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                  >
                    {member.split(" ").map((n) => n[0]).join("")}
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No team members</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span>{new Date(project.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{new Date(project.due_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <span>{project.priority || 3}/5</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {project.tags && project.tags.length > 0 ? (
                    project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the project "{project.name}"? This action will also delete all tasks associated with this project. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit project modal */}
      {isEditModalOpen && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={project}
        />
      )}
    </>
  );
};

export default ProjectCard;
