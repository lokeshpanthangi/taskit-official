
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl">TaskPal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Manage tasks with <span className="text-primary">powerful hierarchy</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                TaskPal helps you organize complex projects through hierarchical to-do lists with smart prioritization.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-primary h-5 w-5" />
                  <span>Create complex task hierarchies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-primary h-5 w-5" />
                  <span>Smart prioritization algorithms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-primary h-5 w-5" />
                  <span>Track progress with visual indicators</span>
                </div>
              </div>
              <div className="pt-4">
                <Link to="/register">
                  <Button size="lg" className="mr-4">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <img 
                src="/placeholder.svg" 
                alt="TaskPal Dashboard Preview" 
                className="w-full h-auto rounded-lg shadow-lg border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Task Management Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage complex projects and keep your team on track
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Hierarchical Task Structure</h3>
              <p className="text-muted-foreground">
                Create parent-child relationships between tasks for better organization of complex projects.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Smart Prioritization</h3>
              <p className="text-muted-foreground">
                Advanced algorithm that calculates task urgency based on multiple factors including deadlines and importance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Visual progress indicators show completion status for both individual tasks and overall projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get organized?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of professionals who use TaskPal to keep their projects on track and their teams aligned.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="font-bold text-lg mb-2">TaskPal</h3>
              <p className="text-muted-foreground max-w-xs">
                Powerful task management for busy professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium mb-3">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Integrations</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Guides</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 border-t pt-6 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TaskPal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
