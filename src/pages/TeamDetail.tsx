
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/components/ui/use-toast";

const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getTeamById, getTeamMembers, leaveTeam } = useTeam();
  const { getTeamProject, createProject } = useProject();
  const { toast } = useToast();
  
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  const team = id ? getTeamById(id) : undefined;
  const teamMembers = id ? getTeamMembers(id) : [];
  const project = id ? getTeamProject(id) : undefined;
  
  const isTeamMember = team?.memberIds.includes(currentUser?.id || "") || false;
  
  useEffect(() => {
    if (!team) {
      toast({
        title: "Team not found",
        description: "The team you're looking for doesn't exist.",
        variant: "destructive",
      });
      navigate("/teams");
    }
  }, [team, navigate, toast]);
  
  const handleLeaveTeam = async () => {
    if (!id) return;
    
    try {
      await leaveTeam(id);
      navigate("/teams");
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };
  
  const handleCreateProject = async () => {
    if (!id || !projectTitle.trim()) return;
    
    setIsCreatingProject(true);
    try {
      const newProject = await createProject(projectTitle, projectDescription, id);
      setProjectTitle("");
      setProjectDescription("");
      setIsDialogOpen(false);
      
      // Navigate to the new project detail page
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsCreatingProject(false);
    }
  };
  
  if (!team) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <PageLayout title={team.name} subtitle="Team details and members">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>
                Created on {new Date(team.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1">{team.description}</p>
                </div>
                
                {team.mentorId && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assigned Mentor</h3>
                    <div className="mt-1 flex items-center">
                      <Avatar className="h-8 w-8 bg-projexia-200">
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <span className="ml-2">Mentor Name</span>
                    </div>
                  </div>
                )}
                
                {project && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Current Project</h3>
                    <div className="mt-1">
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-gray-500">{project.description}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-projexia-600"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View Project Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isTeamMember && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleLeaveTeam}
                  >
                    Leave Team
                  </Button>
                  
                  {!project && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-projexia-600 hover:bg-projexia-700">
                          Create Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create a new project</DialogTitle>
                          <DialogDescription>
                            Define your team's project details below.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="projectTitle">Project Title</Label>
                            <Input
                              id="projectTitle"
                              placeholder="Enter project title"
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="projectDescription">Description</Label>
                            <Textarea
                              id="projectDescription"
                              placeholder="Describe your project in detail"
                              rows={4}
                              value={projectDescription}
                              onChange={(e) => setProjectDescription(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            className="bg-projexia-600 hover:bg-projexia-700"
                            onClick={handleCreateProject}
                            disabled={isCreatingProject || !projectTitle.trim()}
                          >
                            {isCreatingProject ? "Creating..." : "Create Project"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {team.memberIds.length} / 5 members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <li key={member.id} className="flex items-center">
                      <Avatar className="h-8 w-8 bg-projexia-200">
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No members yet</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default TeamDetail;
