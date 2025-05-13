import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "@/components/ui/animated-logo";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(email, password, firstName, lastName);
      if (success) {
        toast.success("Registration successful! Please check your email to confirm your account.");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
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

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  
  const getStrengthText = (strength: number) => {
    if (strength === 0) return "";
    if (strength < 2) return "Weak";
    if (strength < 4) return "Medium";
    return "Strong";
  };
  
  const getStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-muted";
    if (strength < 2) return "bg-destructive";
    if (strength < 4) return "bg-accent";
    return "bg-primary";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden auth-page">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[70%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[20%] left-[50%] -translate-x-1/2 w-[70%] h-[50%] rounded-full accent-bg blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div 
        className="mb-8 flex flex-col items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="flex items-center space-x-2 group">
          <AnimatedLogo size="lg" />
        </Link>
      </motion.div>

      <motion.div 
        className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-8">
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-2 text-center" variants={itemVariants}>
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Create an Account</h2>
              <p className="text-muted-foreground">Join TaskPal and boost your productivity</p>
            </motion.div>
            
            <motion.form className="space-y-5" onSubmit={handleRegister} variants={itemVariants}>
              <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium leading-none">
                    First name
                  </label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder=""
                    required
                    className="h-12 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium leading-none">
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder=""
                    required
                    className="h-12 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </motion.div>
              
              <motion.div className="space-y-2" variants={itemVariants}>
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                  autoComplete="email"
                  className="h-12 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </motion.div>
              
              <motion.div className="space-y-2" variants={itemVariants}>
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    required
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">
                        Password strength: <span className={cn(
                          passwordStrength < 2 && "text-destructive",
                          passwordStrength >= 2 && passwordStrength < 4 && "text-accent",
                          passwordStrength >= 4 && "text-primary",
                        )}>{getStrengthText(passwordStrength)}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={cn(
                            "h-full w-1/5",
                            i < passwordStrength ? getStrengthColor(passwordStrength) : "bg-transparent"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: "20%" }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className={cn(
                          "h-3.5 w-3.5", 
                          password.length >= 8 ? "text-primary" : "text-muted-foreground/40"
                        )} />
                        <span className="text-xs text-muted-foreground">At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className={cn(
                          "h-3.5 w-3.5", 
                          /[A-Z]/.test(password) ? "text-primary" : "text-muted-foreground/40"
                        )} />
                        <span className="text-xs text-muted-foreground">Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className={cn(
                          "h-3.5 w-3.5", 
                          /[0-9]/.test(password) ? "text-primary" : "text-muted-foreground/40"
                        )} />
                        <span className="text-xs text-muted-foreground">Number</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className={cn(
                          "h-3.5 w-3.5", 
                          /[^A-Za-z0-9]/.test(password) ? "text-primary" : "text-muted-foreground/40"
                        )} />
                        <span className="text-xs text-muted-foreground">Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Create account</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
            
            <motion.div className="text-center" variants={itemVariants}>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative bottom gradient bar */}
        <div className="h-1.5 w-full gradient-bar" />
      </motion.div>

      {/* Back to home link */}
      <motion.div 
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
          <ArrowRight className="h-3 w-3 rotate-180" />
          <span>Back to home</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default Register;
