
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star, Calendar, List, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";

const Landing = () => {
  const { theme, setTheme } = useTheme();
  const [hasScrolled, setHasScrolled] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setHasScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <List className="h-10 w-10 text-primary" />,
      title: "Hierarchical Tasks",
      description: "Organize complex projects with parent-child task relationships and keep everything structured."
    },
    {
      icon: <Star className="h-10 w-10 text-primary" />,
      title: "Smart Prioritization",
      description: "Weight tasks by importance and let TaskPal calculate what needs your attention first."
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Multiple Views",
      description: "Switch between list and calendar views to visualize your tasks in the way that works best for you."
    },
    {
      icon: <Bell className="h-10 w-10 text-primary" />,
      title: "Smart Notifications",
      description: "Stay on top of deadlines with intelligent notifications that know what matters most."
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur transition-all ${hasScrolled ? 'border-b shadow-sm' : 'border-transparent'}`}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-2xl">Task<span className="text-primary">Pal</span></span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Hero */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Task Management<br />
                  <span className="text-primary">Made Smart</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  TaskPal helps you organize complex projects through hierarchical to-do lists with intelligent prioritization.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full">Get Started</Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="w-full">Try Demo</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-full max-w-sm lg:max-w-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-primary-foreground opacity-20 blur-3xl" />
                <div className="relative z-10 mx-auto aspect-video overflow-hidden rounded-xl shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-background/80 to-background/20 backdrop-blur-sm"></div>
                  <div className="flex items-center justify-center h-full p-6">
                    <div className="bg-card p-4 rounded-lg shadow-lg w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 bg-primary/20 w-32 rounded"></div>
                          <div className="h-4 bg-primary/10 w-16 rounded"></div>
                        </div>
                        <div className="h-3 bg-primary/10 w-full rounded"></div>
                        <div className="h-3 bg-primary/10 w-[80%] rounded"></div>
                        <div className="h-3 bg-primary/10 w-[90%] rounded"></div>
                        <div className="pt-2 flex justify-end">
                          <div className="h-6 bg-primary w-16 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything you need to stay organized</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                TaskPal combines powerful organization tools with smart prioritization to help you focus on what matters most.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
            {features.map((feature, i) => (
              <Card key={i} className="relative overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="p-2">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to get started?</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Join thousands of professionals who use TaskPal to organize their work and life.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/register">
                <Button size="lg">Create Free Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} TaskPal. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link to="#" className="hover:underline">Terms</Link>
              <Link to="#" className="hover:underline">Privacy</Link>
              <Link to="#" className="hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
