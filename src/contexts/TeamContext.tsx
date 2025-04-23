
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Team, User } from "@/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface TeamContextType {
  teams: Team[];
  isLoading: boolean;
  createTeam: (name: string, description: string) => Promise<Team>;
  joinTeam: (teamId: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  getTeamById: (teamId: string) => Team | undefined;
  getUserTeam: (userId: string) => Team | undefined;
  getTeamMembers: (teamId: string) => User[];
  assignMentorToTeam: (teamId: string, mentorId: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Mock teams for demo
const MOCK_TEAMS: Team[] = [
  {
    id: "1",
    name: "Team Alpha",
    description: "Working on AI-driven project management solutions",
    createdAt: new Date().toISOString(),
    memberIds: ["1"],
    mentorId: "2",
  },
  {
    id: "2",
    name: "Team Beta",
    description: "Developing a new approach to database optimization",
    createdAt: new Date().toISOString(),
    memberIds: [],
    mentorId: undefined,
  },
];

// Mock users for the teams - in a real app would come from a database
const MOCK_TEAM_USERS: User[] = [
  {
    id: "1",
    email: "student@example.com",
    name: "Sample Student",
    role: "student",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "mentor@example.com",
    name: "Sample Mentor",
    role: "mentor",
    createdAt: new Date().toISOString(),
  },
];

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching teams from API
    const loadTeams = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch teams from an API
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Using our mock data for now
        setTeams(MOCK_TEAMS);
      } catch (error) {
        console.error("Error loading teams:", error);
        toast({
          title: "Error",
          description: "Could not load teams. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [toast]);

  const createTeam = async (name: string, description: string): Promise<Team> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (!currentUser) {
        throw new Error("You must be logged in to create a team");
      }
      
      const newTeam: Team = {
        id: (teams.length + 1).toString(),
        name,
        description,
        createdAt: new Date().toISOString(),
        memberIds: [currentUser.id],
        mentorId: undefined,
      };
      
      setTeams((prevTeams) => [...prevTeams, newTeam]);
      
      toast({
        title: "Team created",
        description: `Team ${name} has been created successfully`,
      });
      
      return newTeam;
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create team",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeam = async (teamId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (!currentUser) {
        throw new Error("You must be logged in to join a team");
      }
      
      // Find the team
      const teamIndex = teams.findIndex((team) => team.id === teamId);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }
      
      const team = teams[teamIndex];
      
      // Check if user is already a member
      if (team.memberIds.includes(currentUser.id)) {
        throw new Error("You are already a member of this team");
      }
      
      // Check if team is full (max 5 members)
      if (team.memberIds.length >= 5) {
        throw new Error("Team is full (max 5 members)");
      }
      
      // Add user to team
      const updatedTeam = {
        ...team,
        memberIds: [...team.memberIds, currentUser.id],
      };
      
      setTeams((prevTeams) => 
        prevTeams.map((t) => (t.id === teamId ? updatedTeam : t))
      );
      
      toast({
        title: "Team joined",
        description: `You have successfully joined ${team.name}`,
      });
    } catch (error) {
      console.error("Error joining team:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not join team",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveTeam = async (teamId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (!currentUser) {
        throw new Error("You must be logged in to leave a team");
      }
      
      // Find the team
      const teamIndex = teams.findIndex((team) => team.id === teamId);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }
      
      const team = teams[teamIndex];
      
      // Check if user is a member
      if (!team.memberIds.includes(currentUser.id)) {
        throw new Error("You are not a member of this team");
      }
      
      // Remove user from team
      const updatedTeam = {
        ...team,
        memberIds: team.memberIds.filter((id) => id !== currentUser.id),
      };
      
      setTeams((prevTeams) => 
        prevTeams.map((t) => (t.id === teamId ? updatedTeam : t))
      );
      
      toast({
        title: "Team left",
        description: `You have successfully left ${team.name}`,
      });
    } catch (error) {
      console.error("Error leaving team:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not leave team",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamById = (teamId: string) => {
    return teams.find((team) => team.id === teamId);
  };

  const getUserTeam = (userId: string) => {
    return teams.find((team) => team.memberIds.includes(userId));
  };

  const getTeamMembers = (teamId: string): User[] => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return [];
    
    return MOCK_TEAM_USERS.filter((user) => team.memberIds.includes(user.id));
  };

  const assignMentorToTeam = async (teamId: string, mentorId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Find the team
      const teamIndex = teams.findIndex((team) => team.id === teamId);
      if (teamIndex === -1) {
        throw new Error("Team not found");
      }
      
      // Find the mentor (would validate in real app)
      const mentor = MOCK_TEAM_USERS.find((user) => user.id === mentorId && user.role === "mentor");
      if (!mentor) {
        throw new Error("Mentor not found");
      }
      
      // Update the team with the mentor
      const updatedTeam = {
        ...teams[teamIndex],
        mentorId,
      };
      
      setTeams((prevTeams) => 
        prevTeams.map((t) => (t.id === teamId ? updatedTeam : t))
      );
      
      toast({
        title: "Mentor assigned",
        description: `${mentor.name} has been assigned to the team`,
      });
    } catch (error) {
      console.error("Error assigning mentor:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not assign mentor",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        isLoading,
        createTeam,
        joinTeam,
        leaveTeam,
        getTeamById,
        getUserTeam,
        getTeamMembers,
        assignMentorToTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};
