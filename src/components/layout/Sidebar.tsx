
import { NavLink } from "react-router-dom";
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

const Sidebar = () => {
  const { user } = useAuth();
  
  const mainNavItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, to: "/dashboard" },
    { name: "Tasks", icon: <CheckSquare className="h-5 w-5" />, to: "/tasks" },
    { name: "Calendar", icon: <Calendar className="h-5 w-5" />, to: "/calendar" },
    { name: "Projects", icon: <FolderKanban className="h-5 w-5" />, to: "/projects" },
  ];

  const recentProjects = [
    { name: "Website Redesign", to: "/projects/website" },
    { name: "Product Launch", to: "/projects/launch" },
    { name: "Marketing Campaign", to: "/projects/marketing" },
  ];
  
  return (
    <SidebarContainer>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            TP
          </div>
          <h1 className="text-xl font-semibold">TaskPal</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex justify-center py-2">
              <Button size="sm" className="w-full">
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
                    className={({ isActive }) => 
                      isActive ? "sidebar-item active" : "sidebar-item"
                    }
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
                  <Button variant="ghost" size="icon" className="h-5 w-5">
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
              {recentProjects.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <NavLink 
                    to={project.to}
                    className={({ isActive }) => 
                      isActive ? "sidebar-item active" : "sidebar-item"
                    }
                  >
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span>{project.name}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <NavLink 
          to="/settings"
          className={({ isActive }) => 
            isActive 
              ? "flex items-center gap-2 py-2 px-3 rounded-md bg-accent/10" 
              : "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/10"
          }
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
