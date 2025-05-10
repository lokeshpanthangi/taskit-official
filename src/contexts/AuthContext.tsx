
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, check session with API
        const savedUser = localStorage.getItem('taskpal_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mock login function
  const login = async (email: string, password: string, remember: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation for demo purposes
      if (email === "" || password === "") {
        toast({
          title: "Error",
          description: "Please enter your email and password",
          variant: "destructive",
        });
        return false;
      }

      // Demo credentials check
      if (email === "demo@example.com" && password === "password") {
        const user = { 
          id: "user-123", 
          name: "Demo User", 
          email: "demo@example.com",
          avatarUrl: "/placeholder.svg"
        };
        
        setUser(user);
        
        // Save to localStorage if remember is checked
        if (remember) {
          localStorage.setItem('taskpal_user', JSON.stringify(user));
        }
        
        toast({
          title: "Welcome back",
          description: "You have successfully logged in.",
        });
        
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "Invalid email or password. Try using demo@example.com and password.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!name || !email || !password) {
        toast({
          title: "Registration failed",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        return false;
      }
      
      // In a real app, validate email format, password strength, etc.
      
      // Create new user (in a real app, this would be an API call)
      const user = { id: `user-${Date.now()}`, name, email };
      setUser(user);
      localStorage.setItem('taskpal_user', JSON.stringify(user));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created.",
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskpal_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  // Password reset functions
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email) {
        toast({
          title: "Error",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return false;
      }
      
      // In a real app, this would send an email with reset instructions
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!token || !newPassword) {
        toast({
          title: "Error",
          description: "Invalid reset token or password",
          variant: "destructive",
        });
        return false;
      }
      
      // In a real app, validate token and update password in the database
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully. You can now log in.",
      });
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: "The reset link may be invalid or expired. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
