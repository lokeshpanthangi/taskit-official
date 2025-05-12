
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { useTheme } from "next-themes";

const Settings = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Profile form state
  const [name, setName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  
  // Notification settings state
  const [notifyTaskDue, setNotifyTaskDue] = useState(true);
  const [notifyTaskAssigned, setNotifyTaskAssigned] = useState(true);
  const [notifyTaskComment, setNotifyTaskComment] = useState(false);
  const [notifyProjectUpdate, setNotifyProjectUpdate] = useState(true);
  const [notifyProjectMember, setNotifyProjectMember] = useState(false);
  const [emailFrequency, setEmailFrequency] = useState("daily");
  
  // Appearance settings state
  const [compactMode, setCompactMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>(theme || "system");
  
  // Security settings state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [autoLogout, setAutoLogout] = useState(true);
  const [inactivityTimeout, setInactivityTimeout] = useState("60");
  
  // Save functions for each section
  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };
  
  const handleSaveNotifications = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Notification preferences saved");
    }, 1000);
  };
  
  const handleSaveAppearance = () => {
    setSaving(true);
    // Actually change the theme
    if (selectedTheme !== theme) {
      setTheme(selectedTheme);
    }
    
    setTimeout(() => {
      setSaving(false);
      toast.success("Appearance settings updated");
    }, 1000);
  };
  
  const handleSaveSecurity = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Security settings updated");
    }, 1000);
  };
  
  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    }, 1500);
  };
  
  const handleDeleteAccount = () => {
    toast.error("This action is not available in the demo");
  };
  
  const handleSelectTheme = (themeType: string) => {
    setSelectedTheme(themeType);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="animate-pop">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="animate-pop [animation-delay:50ms]">Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="animate-pop [animation-delay:100ms]">Appearance</TabsTrigger>
          <TabsTrigger value="security" className="animate-pop [animation-delay:150ms]">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information and email address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div>
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar_url || ""} alt={user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ""} />
                      <AvatarFallback className="text-lg">{user?.first_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Profile Photo</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toast.info("Image upload feature coming soon")}>Change</Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => toast.info("Avatar removed")}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio"
                      className="w-full min-h-24 p-2 border rounded-md resize-y"
                      placeholder="Write a short bio about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                    <p className="text-xs text-muted-foreground">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Task Notifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-task-due">Task due date reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when tasks are approaching their due date
                      </p>
                    </div>
                    <Switch 
                      id="notify-task-due" 
                      checked={notifyTaskDue} 
                      onCheckedChange={setNotifyTaskDue} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-task-assigned">Task assignments</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when tasks are assigned to you
                      </p>
                    </div>
                    <Switch 
                      id="notify-task-assigned" 
                      checked={notifyTaskAssigned} 
                      onCheckedChange={setNotifyTaskAssigned}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-task-comment">Task comments</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone comments on your tasks
                      </p>
                    </div>
                    <Switch 
                      id="notify-task-comment"
                      checked={notifyTaskComment}
                      onCheckedChange={setNotifyTaskComment}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Project Notifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-project-update">Project updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about project progress and milestones
                      </p>
                    </div>
                    <Switch 
                      id="notify-project-update"
                      checked={notifyProjectUpdate}
                      onCheckedChange={setNotifyProjectUpdate}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notify-project-member">Team changes</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when team members join or leave a project
                      </p>
                    </div>
                    <Switch 
                      id="notify-project-member"
                      checked={notifyProjectMember}
                      onCheckedChange={setNotifyProjectMember}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notification Frequency</h3>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Daily digest</Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="email-daily" 
                        name="email-frequency" 
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        checked={emailFrequency === "daily"}
                        onChange={() => setEmailFrequency("daily")}
                      />
                      <label htmlFor="email-daily" className="text-sm">Send a daily summary</label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Real-time</Label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="email-instant" 
                        name="email-frequency"
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        checked={emailFrequency === "instant"}
                        onChange={() => setEmailFrequency("instant")}
                      />
                      <label htmlFor="email-instant" className="text-sm">Send emails immediately</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div 
                      className={`border rounded-lg p-2 cursor-pointer ${selectedTheme === 'light' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary'}`}
                      onClick={() => handleSelectTheme('light')}
                    >
                      <div className="h-20 bg-white rounded-md border"></div>
                      <p className="mt-2 text-center text-sm">Light</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div 
                      className={`border rounded-lg p-2 cursor-pointer ${selectedTheme === 'dark' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary'}`}
                      onClick={() => handleSelectTheme('dark')}
                    >
                      <div className="h-20 bg-slate-900 rounded-md border border-gray-700"></div>
                      <p className="mt-2 text-center text-sm">Dark</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div 
                      className={`border rounded-lg p-2 cursor-pointer ${selectedTheme === 'system' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary'}`}
                      onClick={() => handleSelectTheme('system')}
                    >
                      <div className="h-20 bg-gradient-to-b from-white to-slate-900 rounded-md border"></div>
                      <p className="mt-2 text-center text-sm">System</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Layout</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-mode">Compact mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Display more content with less spacing
                      </p>
                    </div>
                    <Switch 
                      id="compact-mode"
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reduce-motion">Reduce motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Decrease the amount of animation effects
                      </p>
                    </div>
                    <Switch 
                      id="reduce-motion"
                      checked={reduceMotion}
                      onCheckedChange={setReduceMotion}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveAppearance} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and session settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleUpdatePassword}>Update Password</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Settings</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-logout">Auto-logout after inactivity</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out after a period of inactivity
                      </p>
                    </div>
                    <Switch 
                      id="auto-logout"
                      checked={autoLogout}
                      onCheckedChange={setAutoLogout} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Inactivity timeout</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={inactivityTimeout}
                    onChange={(e) => setInactivityTimeout(e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Activity</h3>
                
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    Last login: Today at 10:45 AM from 192.168.1.1
                  </p>
                  
                  <Button variant="outline" className="mt-4 text-sm" onClick={() => toast.info("Login history feature coming soon")}>
                    View login history
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
              <Button onClick={handleSaveSecurity} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
