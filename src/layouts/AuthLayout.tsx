
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        {/* Left side with brand info and image */}
        <div className="hidden lg:flex w-1/2 bg-primary p-8 text-primary-foreground flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold">TaskPal</h1>
            <p className="text-primary-foreground/80 mt-2">Organize complex projects with smart prioritization</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
                <path d="m9 16 2 2 4-4"></path>
              </svg>
            </div>
          </div>
          
          <div className="text-sm text-primary-foreground/70">
            <p>© 2025 TaskPal. All rights reserved.</p>
          </div>
        </div>
        
        {/* Right side with auth form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
