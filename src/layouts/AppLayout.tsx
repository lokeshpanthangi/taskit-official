
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import { useTheme } from "next-themes";

const AppLayout = () => {
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  // Set default theme if none is selected
  useEffect(() => {
    if (!theme) {
      setTheme("light");
    }
  }, [theme, setTheme]);

  // Toggle task detail panel
  const toggleDetailPanel = (taskId?: string) => {
    if (taskId) {
      setSelectedTaskId(taskId);
      setIsDetailPanelOpen(true);
    } else {
      setIsDetailPanelOpen(!isDetailPanelOpen);
    }
  };

  // Close task detail panel
  const closeDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Main sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden w-full">
          {/* Top header - modified to have Header component span full width */}
          <Header />
          
          {/* Content with optional right panel */}
          <div className="flex flex-1 overflow-hidden w-full">
            {/* Main scrollable content */}
            <main className="flex-1 overflow-y-auto p-6 w-full h-full">
              <Outlet context={{ toggleDetailPanel }} />
            </main>
            
            {/* Right panel for task details (conditionally rendered) */}
            {isDetailPanelOpen && (
              <div className="w-96 border-l border-border/40 bg-card overflow-y-auto">
                <TaskDetailPanel 
                  taskId={selectedTaskId} 
                  onClose={closeDetailPanel}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
