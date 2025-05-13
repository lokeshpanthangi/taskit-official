import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Calendar, Star, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const featureCardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 400, damping: 10 }
    }
  };

  const features = [
    {
      title: "Task Management",
      description: "Create, organize, and track your tasks with ease",
      icon: <CheckCircle className="h-6 w-6 text-primary" />
    },
    {
      title: "Deadline Tracking",
      description: "Never miss an important deadline again",
      icon: <Clock className="h-6 w-6 text-primary" />
    },
    {
      title: "Calendar View",
      description: "Visualize your tasks and schedule at a glance",
      icon: <Calendar className="h-6 w-6 text-primary" />
    },
    {
      title: "Priority System",
      description: "Focus on what matters most with priority levels",
      icon: <Star className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[80%] h-[80%] rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Header */}
      <motion.header 
        className="container mx-auto py-6 px-4 flex justify-between items-center z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/30">
            <motion.span
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              TP
            </motion.span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">TaskPal</span>
        </Link>
        
        <div className="flex space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" asChild className="rounded-lg px-5 font-medium">
              <Link to="/login">Log in</Link>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="rounded-lg px-5 font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
              <Link to="/register">Sign up</Link>
            </Button>
          </motion.div>
        </div>
      </motion.header>
      
      {/* Hero Section */}
      <motion.section 
        className="flex-1 container mx-auto px-4 pt-10 pb-20 flex flex-col lg:flex-row items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="lg:w-1/2 space-y-8 py-8 lg:py-16">
          <motion.div variants={itemVariants}>
            <Badge className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20 rounded-full">
              Productivity Reimagined
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Organize</span> your tasks.<br />
              <span className="relative">
                <span className="relative z-10">Boost your</span>{" "}
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-accent to-yellow-400">productivity</span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-3 bg-accent/20 rounded-full -z-0"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-lg"
            variants={itemVariants}
          >
            Everything you need to stay organized, hit deadlines, and manage your workload effectively with a beautiful, intuitive interface.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <Button 
                size="lg" 
                asChild 
                className="text-lg rounded-xl px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden"
              >
                <Link to="/register" className="flex items-center gap-2">
                  <span>Get Started</span>
                  <motion.div
                    animate={isHovered ? { x: 5 } : { x: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-lg rounded-xl px-8 py-6 border-2 hover:bg-accent/5"
              >
                <Link to="/login">Learn More</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="lg:w-1/2 py-8 lg:py-0 flex justify-center">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          >
            <div className="w-[650px] h-[550px] rounded-3xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border border-primary/10 shadow-2xl">
              <img src="/lovable-uploads/taskpal-pure-animation.svg" alt="TaskPal Visualization" className="w-[120%] h-auto" />
            </div>
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
            <motion.div 
              className="absolute -top-6 -left-6 w-48 h-48 bg-accent/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
            
            {/* Floating UI elements */}
            <motion.div 
              className="absolute top-10 -right-10 bg-card shadow-lg rounded-xl p-4 border border-border/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Task completed</p>
                  <p className="text-xs text-muted-foreground">Project presentation</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-20 -left-12 bg-card shadow-lg rounded-xl p-4 border border-border/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Meeting scheduled</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <section className="bg-card/50 py-20 border-t border-b border-border/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features to Boost Your Productivity</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">TaskPal comes packed with everything you need to organize your work and life.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-background rounded-xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
                variants={featureCardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <motion.section 
        className="py-20 container mx-auto px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-primary/20 shadow-xl">
          <motion.div 
            className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"
            animate={{ 
              backgroundPosition: ['0px 0px', '100px 100px'],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to transform how you manage tasks?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands of users who have already improved their productivity with TaskPal.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-10"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button 
                size="lg" 
                asChild 
                className="text-lg rounded-xl px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
              >
                <Link to="/register" className="flex items-center gap-2">
                  <span>Get Started for Free</span>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
        </div>
      </motion.section>
      
      {/* Footer */}
      <footer className="container mx-auto py-10 px-4 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
              TP
            </div>
            <span className="text-lg font-semibold">TaskPal</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 md:mb-0 md:order-last">
            © 2025 TaskPal. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
