import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { getCurrentUser, updateUserProfile, UserProfile } from '@/services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session?.user) {
          try {
            // Use setTimeout to avoid potential recursion with Supabase auth
            setTimeout(async () => {
              const profileData = await getCurrentUser();
              setUser(profileData);
              setIsAuthenticated(true);
              setIsLoading(false);
            }, 0);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profileData = await getCurrentUser();
          setUser(profileData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Welcome back",
        description: "You have successfully logged in.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          },
        },
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please check your email to confirm your account.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Use the token to verify the user's session
      // Note: When using the reset password flow in Supabase, the token is handled automatically
      // through the URL and the user is already in a valid session when they reach this point
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been reset successfully. You can now log in.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "The reset link may be invalid or expired. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
