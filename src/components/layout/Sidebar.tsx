
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar as SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CheckSquare, Calendar, Settings, FolderKanban, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/services/projectService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  
  const mainNavItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, to: "/dashboard" },
    { name: "Tasks", icon: <CheckSquare className="h-5 w-5" />, to: "/tasks" },
    { name: "Calendar", icon: <Calendar className="h-5 w-5" />, to: "/calendar" },
    { name: "Projects", icon: <FolderKanban className="h-5 w-5" />, to: "/projects" },
  ];

  // Fetch real project data
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
  
  // Get recent projects (up to 3)
  const recentProjects = projects 
    ? projects.slice(0, 3).map(project => ({ 
        name: project.name, 
        to: `/projects/${project.id}` 
      }))
    : [];
  
  return (
    <SidebarContainer>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold animate-pulse">
            TP
          </div>
          <h1 className="text-xl font-semibold">TaskPal</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex justify-center py-2">
              <Button 
                size="sm" 
                className="w-full animate-fade-in hover:scale-105 transition-transform"
                onClick={() => window.location.href = "/tasks"}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <NavLink 
                    to={item.to}
                    className={({ isActive }) => {
                      return cn(
                        "sidebar-item transition-all duration-200",
                        isActive && "sidebar-item active",
                        isActive && "font-medium",
                        isActive && theme === "light" ? "bg-accent/40 text-primary" : "",
                        isActive && theme === "dark" ? "bg-accent/20 text-accent-foreground" : ""
                      )
                    }}
                  >
                    {item.icon} 
                    <span>{item.name}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            <span>Recent Projects</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 hover:scale-110 transition-transform"
                    onClick={() => setIsProjectDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="sr-only">Add project</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-3 py-4 text-center">
                  <div className="animate-pulse h-4 bg-muted rounded w-2/3 mx-auto"></div>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No projects yet
                </div>
              ) : (
                recentProjects.map((project) => (
                  <SidebarMenuItem key={project.name}>
                    <NavLink 
                      to={project.to}
                      className={({ isActive }) => {
                        return cn(
                          "sidebar-item transition-all duration-200",
                          isActive && "sidebar-item active",
                          isActive && "font-medium",
                          isActive && theme === "light" ? "bg-accent/40 text-primary" : "",
                          isActive && theme === "dark" ? "bg-accent/20 text-accent-foreground" : ""
                        )
                      }}
                    >
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{project.name}</span>
                    </NavLink>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <NavLink 
          to="/settings"
          className={({ isActive }) => {
            return cn(
              "flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-200",
              isActive ? "bg-accent/20 font-medium" : "hover:bg-primary/10",
              isActive && theme === "light" ? "bg-accent/40 text-primary" : "",
              isActive && theme === "dark" ? "bg-accent/20 text-accent-foreground" : ""
            )
          }}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </SidebarFooter>

      {/* Project Creation Modal */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <CreateProjectModal onSuccess={() => setIsProjectDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </SidebarContainer>
  );
};

export default Sidebar;
