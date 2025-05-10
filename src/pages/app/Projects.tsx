
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

// Mock projects data
const initialProjects = [
  {
    id: "project-1",
    name: "Website Redesign",
    description: "Redesign the company website with modern UI/UX",
    progress: 65,
    startDate: "2025-05-15",
    dueDate: "2025-06-30",
    tasks: {
      total: 12,
      completed: 7,
    },
    team: ["John D.", "Sarah M.", "Alex K."],
    tags: ["Design", "Development"],
  },
  {
    id: "project-2",
    name: "Product Launch",
    description: "Launch new product features for Q3",
    progress: 40,
    startDate: "2025-05-20",
    dueDate: "2025-08-15",
    tasks: {
      total: 18,
      completed: 7,
    },
    team: ["Michael P.", "Emma S.", "David L.", "Lisa R."],
    tags: ["Product", "Marketing"],
  },
  {
    id: "project-3",
    name: "Marketing Campaign",
    description: "Q3 digital marketing campaign across platforms",
    progress: 25,
    startDate: "2025-06-01",
    dueDate: "2025-08-30",
    tasks: {
      total: 15,
      completed: 4,
    },
    team: ["Nicole F.", "Robert T.", "Jennifer B."],
    tags: ["Marketing", "Content"],
  },
];

const Projects = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const handleCreateProject = (newProject) => {
    setProjects([...projects, newProject]);
    toast.success("Project created successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
      
      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden gradient-border bg-card">
            <CardHeader className="bg-muted/30">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description}
                  </p>
                </div>
                
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium mb-2">Progress</h3>
                  <div className="flex items-center space-x-2">
                    <Progress value={project.progress} className="h-2" />
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                  <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{project.tasks.completed}/{project.tasks.total} tasks completed</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Team</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.team.map((member, index) => (
                      <div key={index} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {member.split(" ").map(n => n[0]).join("")}
                      </div>
                    ))}
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full p-0">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add team member</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date</span>
                      <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
