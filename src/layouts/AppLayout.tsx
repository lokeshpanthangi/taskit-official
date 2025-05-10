
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";
import NotificationHeader from "@/components/layout/NotificationHeader";

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
          <div className="flex items-center justify-between p-4 border-b">
            <Header />
            <div className="flex items-center gap-2">
              <NotificationHeader toggleDetailPanel={toggleDetailPanel} />
            </div>
          </div>
          
          {/* Content with optional right panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main scrollable content */}
            <main className="flex-1 overflow-y-auto p-6">
              <Outlet context={{ toggleDetailPanel }} />
            </main>
            
            {/* Right panel for task details (conditionally rendered) */}
            {isDetailPanelOpen && (
              <div className="w-96 border-l bg-background overflow-y-auto">
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
