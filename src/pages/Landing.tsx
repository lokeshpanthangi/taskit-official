
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            TP
          </div>
          <span className="text-xl font-semibold">TaskPal</span>
        </div>
        
        <div className="flex space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          
          <Button asChild>
            <Link to="/register">Sign up</Link>
          </Button>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 space-y-8 py-12 lg:py-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            <span className="text-primary">Organize</span> your tasks.<br />
            <span>
              <span className="text-white">Be</span> <span className="text-blue-500">Part of the Solution</span>
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg">
            Everything you need to stay organized, hit deadlines, and manage your workload effectively.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" asChild className="text-lg">
              <Link to="/register">Get Started</Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild className="text-lg">
              <Link to="/login">Learn More</Link>
            </Button>
          </div>
        </div>
        
        <div className="lg:w-1/2 py-12 lg:py-24 flex justify-center">
          <div className="relative">
            <div className="w-[650px] h-[550px] rounded-2xl flex items-center justify-center overflow-hidden bg-transparent">
              <img src="/lovable-uploads/taskpal-pure-animation.svg" alt="TaskPal Visualization" className="w-[120%] h-auto" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="container mx-auto py-6 px-4 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2025 TaskPal. All rights reserved.</p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
