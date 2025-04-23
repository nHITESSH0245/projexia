
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
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
import PageLayout from "@/components/PageLayout";
import CountdownTimer from "@/components/CountdownTimer";
import { UserRole, Team, User } from "@/types";
import { User as LucideUser } from "lucide-react";

const Teams = () => {
  const { currentUser } = useAuth();
  const { teams, createTeam, joinTeam, leaveTeam, getUserTeam } = useTeam();
  const navigate = useNavigate();

  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const teamFormationDeadline = new Date();
  teamFormationDeadline.setDate(teamFormationDeadline.getDate() + 30);

  const userTeam = currentUser ? getUserTeam(currentUser.id) : undefined;

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    
    setIsCreatingTeam(true);
    try {
      const team = await createTeam(newTeamName, newTeamDescription);
      setNewTeamName("");
      setNewTeamDescription("");
      setIsDialogOpen(false);
      navigate(`/teams/${team.id}`);
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await joinTeam(teamId);
      navigate(`/teams/${teamId}`);
    } catch (error) {
      console.error("Error joining team:", error);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    try {
      await leaveTeam(teamId);
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };

  const renderTeamsList = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            currentUser={currentUser}
            userTeam={userTeam}
            onJoin={handleJoinTeam}
            onLeave={handleLeaveTeam}
          />
        ))}
      </div>
    );
  };

  return (
    <PageLayout
      title="Teams"
      subtitle="Browse available teams or create your own"
    >
      <div className="mb-8 flex items-center justify-between">
        <CountdownTimer targetDate={teamFormationDeadline.toISOString()} />
        
        {currentUser?.role === "student" && !userTeam && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-projexia-600 hover:bg-projexia-700">
                Create New Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new team</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create your new project team.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamDescription">Description</Label>
                  <Textarea
                    id="teamDescription"
                    placeholder="Describe your team and project idea"
                    rows={4}
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-projexia-600 hover:bg-projexia-700"
                  onClick={handleCreateTeam}
                  disabled={isCreatingTeam || !newTeamName.trim()}
                >
                  {isCreatingTeam ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {teams.length > 0 ? (
        renderTeamsList()
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No teams available. Be the first to create one!</p>
        </div>
      )}
    </PageLayout>
  );
};

interface TeamCardProps {
  team: Team;
  currentUser: User | null;
  userTeam: Team | undefined;
  onJoin: (teamId: string) => Promise<void>;
  onLeave: (teamId: string) => Promise<void>;
}

const TeamCard = ({ team, currentUser, userTeam, onJoin, onLeave }: TeamCardProps) => {
  const isUserInTeam = Boolean(userTeam && userTeam.id === team.id);
  const isMember = team.memberIds.includes(currentUser?.id || "");
  const isTeamFull = team.memberIds.length >= 5;
  
  const canJoin = currentUser?.role === "student" && !userTeam && !isTeamFull;
  
  return (
    <Card className={isUserInTeam ? "border-projexia-500 shadow-md" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{team.name}</span>
          {isUserInTeam && (
            <span className="text-xs bg-projexia-100 text-projexia-800 px-2 py-1 rounded">
              Your Team
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {team.memberIds.length} / 5 members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 min-h-[60px]">{team.description}</p>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Members:</h4>
          <div className="mt-1 flex -space-x-2 overflow-hidden">
            {team.memberIds.map((memberId) => (
              <div
                key={memberId}
                className="inline-block h-8 w-8 rounded-full bg-projexia-200 border-2 border-white text-center flex items-center justify-center"
              >
                <span className="text-xs font-medium">{memberId[0].toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isMember ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLeave(team.id)}
          >
            Leave Team
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className={
              canJoin
                ? "bg-projexia-600 hover:bg-projexia-700"
                : "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
            }
            disabled={!canJoin}
            onClick={() => canJoin && onJoin(team.id)}
          >
            {isTeamFull ? "Team Full" : userTeam ? "Already in a Team" : "Join Team"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Teams;
