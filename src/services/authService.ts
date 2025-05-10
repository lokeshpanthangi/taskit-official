
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
  email?: string; 
}

export const getCurrentUser = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error("Error getting current user:", userError);
    return null;
  }
  
  // Get the user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
    
  if (profileError) {
    console.error("Error getting user profile:", profileError);
  }
  
  return {
    id: user.id,
    email: user.email,
    first_name: profile?.first_name || null,
    last_name: profile?.last_name || null,
    avatar_url: profile?.avatar_url || null,
    created_at: profile?.created_at || null,
  };
};

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error("Error getting current user:", userError);
    throw userError || new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
  
  return data as UserProfile;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("Error signing in:", error);
    throw error;
  }
  
  return data;
};

export const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
  
  if (error) {
    console.error("Error signing up:", error);
    throw error;
  }
  
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
  
  return true;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
  
  return true;
};
