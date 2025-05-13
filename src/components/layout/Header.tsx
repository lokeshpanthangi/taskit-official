
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationHeader from "./NotificationHeader";
import { getCurrentUser, signOut } from "@/services/authService";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { AnimatedLogo } from "@/components/ui/animated-logo";

const Header = () => {
  const { user: authUser, logout } = useAuth();
  const { isAuthenticated, user: supabaseUser } = useSupabaseAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // Fetch user profile
  useEffect(() => {
    if (isAuthenticated && supabaseUser) {
      const fetchProfile = async () => {
        try {
          const profile = await getCurrentUser();
          setProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
      
      fetchProfile();
    }
  }, [isAuthenticated, supabaseUser]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Clear all queries from the cache
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SidebarTrigger>

        {/* Empty space for layout balance */}
        <div className="flex-1">
        </div>

        {/* User actions moved to the right end */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}
          
          {isAuthenticated ? (
            <>
              <NotificationHeader 
                toggleDetailPanel={(taskId) => navigate(`/tasks?taskId=${taskId}`)} 
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || ""} />
                      <AvatarFallback>
                        {profile?.first_name?.charAt(0) || supabaseUser?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {supabaseUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/settings">Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="outline" asChild>
              <a href="/login">Log In</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
