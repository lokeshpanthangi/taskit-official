import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DialogFooter } from "@/components/ui/dialog";
import { createProject } from "@/services/projectService";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/components/ui/sonner";

interface CreateProjectModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (project: any) => void;
  onSuccess?: () => void;
}

const CreateProjectModal = ({ isOpen, onClose, onSave, onSuccess }: CreateProjectModalProps) => {
  const { user } = useSupabaseAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week later
  const [priority, setPriority] = useState<number>(3); // Default priority is 3 (medium)
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isDueDatePickerOpen, setIsDueDatePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSave = async () => {
    if (!name.trim()) return;
    
    if (onSave) {
      onSave({
        name: name.trim(),
        description: description.trim(),
        startDate: startDate.toISOString(),
        dueDate: dueDate.toISOString(),
        priority,
        tags,
        user_id: user?.id
      });
      
      // Reset form
      setName("");
      setDescription("");
      setStartDate(new Date());
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setPriority(3);
      setTags([]);
      setCurrentTag("");
      
      if (onClose) {
        onClose();
      }
      
      return;
    }
    
    setIsLoading(true);
    
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        start_date: startDate.toISOString(),
        due_date: dueDate.toISOString(),
        priority,
        tags,
        user_id: user?.id
      };
      
      await createProject(projectData);
      
      toast.success("Project created successfully");
      
      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          placeholder="Project name"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
          placeholder="Project description (optional)"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right">
          Start Date
        </Label>
        <div className="col-span-3">
          <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  if (date) {
                    setStartDate(date);
                    setIsStartDatePickerOpen(false);
                    
                    // If due date is now before start date, adjust it
                    if (date > dueDate) {
                      setDueDate(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000));
                    }
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dueDate" className="text-right">
          Due Date
        </Label>
        <div className="col-span-3">
          <Popover open={isDueDatePickerOpen} onOpenChange={setIsDueDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dueDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  if (date) {
                    setDueDate(date);
                    setIsDueDatePickerOpen(false);
                  }
                }}
                disabled={(date) => date < startDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="priority" className="text-right">
          Priority
        </Label>
        <div className="col-span-3 flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <Button
              key={value}
              type="button"
              variant={priority === value ? "default" : "outline"}
              size="sm"
              onClick={() => setPriority(value)}
              className={cn(
                "flex-1",
                priority === value && "border-primary"
              )}
            >
              {value}
            </Button>
          ))}
        </div>
        <div className="col-span-4 text-center text-sm text-muted-foreground mt-1">
          {priority === 1 && "Very Low"}
          {priority === 2 && "Low"}
          {priority === 3 && "Medium"}
          {priority === 4 && "High"}
          {priority === 5 && "Very High"}
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="tags" className="text-right">
          Tags
        </Label>
        <div className="col-span-3">
          <div className="flex">
            <Input
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Add tag and press Enter"
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="ml-2" 
              onClick={handleAddTag}
              disabled={!currentTag.trim()}
            >
              Add
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1">
                  {tag}
                  <X 
                    size={14} 
                    className="ml-1 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
          {isLoading ? "Creating..." : "Create Project"}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default CreateProjectModal;
