
import { Outlet, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20"></div>
          <div className="h-4 w-32 rounded bg-primary/20"></div>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background auth-page">
      {/* Navigation buttons */}
      <div className="fixed top-4 left-4 right-4 flex justify-between z-10">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link to="/" aria-label="Back to home">
            <Home className="h-[1.2rem] w-[1.2rem]" />
          </Link>
        </Button>
        <ThemeToggle />
      </div>
      
      <div className="flex flex-1 justify-center items-center">
        {/* Centered auth form */}
        <div className="w-full max-w-xl p-8 flex items-center justify-center">
          <div className="w-full space-y-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
