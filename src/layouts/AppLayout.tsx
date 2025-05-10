
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";

const AppLayout = () => {
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Main sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top header */}
          <Header />
          
          {/* Content with optional right panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main scrollable content */}
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet context={{ toggleDetailPanel }} />
            </main>
            
            {/* Right panel for task details (conditionally rendered) */}
            {isDetailPanelOpen && (
              <TaskDetailPanel 
                taskId={selectedTaskId} 
                onClose={closeDetailPanel}
              />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
