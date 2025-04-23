
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useProject } from "@/contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "@/components/CountdownTimer";
import { User, Users, ClipboardCheck, Bell } from "lucide-react";

interface DashboardProps {
  teamFormationDeadline: Date;
}

const Dashboard = ({ teamFormationDeadline }: DashboardProps) => {
  const { currentUser } = useAuth();
  const { teams, getUserTeam } = useTeam();
  const { projects } = useProject();
  const navigate = useNavigate();

  if (!currentUser) {
    return null;
  }

  const userTeam = getUserTeam(currentUser.id);
  const teamProject = userTeam
    ? projects.find((p) => p.teamId === userTeam.id)
    : undefined;

  // Student Dashboard View
  if (currentUser.role === "student") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Hi {currentUser.name}, ready to build something awesome?
              </CardTitle>
              <CardDescription>
                Track your team and project progress here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Team Status Card */}
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-projexia-600 mr-2" />
                    <h3 className="font-medium">Team Status</h3>
                  </div>
                  
                  {!userTeam ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        You're not part of any team yet. Create a new team or join an existing one.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          className="bg-projexia-600 hover:bg-projexia-700"
                          onClick={() => navigate("/teams")}
                        >
                          Find Teams
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{userTeam.name}</h4>
                          <p className="text-sm text-gray-500">
                            {userTeam.memberIds.length} team members
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/teams/${userTeam.id}`)}
                        >
                          Team Details
                        </Button>
                      </div>
                      
                      {userTeam.mentorId ? (
                        <div className="bg-green-50 text-green-800 px-3 py-2 rounded-md text-sm">
                          <span className="font-medium">Mentor Assigned:</span> Your team has a mentor
                        </div>
                      ) : (
                        <div className="bg-yellow-50 text-yellow-800 px-3 py-2 rounded-md text-sm">
                          <span className="font-medium">Pending Mentor:</span> Your team is waiting for a mentor assignment
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Project Status Card */}
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <ClipboardCheck className="h-5 w-5 text-projexia-600 mr-2" />
                    <h3 className="font-medium">Project Status</h3>
                  </div>
                  
                  {!teamProject ? (
                    userTeam ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Your team hasn't created a project yet.
                        </p>
                        <Button
                          className="bg-projexia-600 hover:bg-projexia-700"
                          onClick={() => navigate(`/teams/${userTeam.id}`)}
                        >
                          Create Project
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Join a team first to create or view projects.
                      </p>
                    )
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{teamProject.title}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge className="bg-projexia-100 text-projexia-800">
                              {teamProject.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/projects/${teamProject.id}`)}
                        >
                          Project Details
                        </Button>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-projexia-600 h-2 rounded-full"
                            style={{
                              width: `${Math.round(
                                (teamProject.deliverables.filter((d) => d.status === "approved").length /
                                  Math.max(teamProject.deliverables.length, 1)) *
                                  100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-projexia-600 mr-2" />
                <CardTitle>Important Dates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-projexia-50 p-4 rounded-lg border border-projexia-100">
                  <h3 className="font-medium text-projexia-800">Team Formation Deadline</h3>
                  <div className="mt-3">
                    <CountdownTimer targetDate={teamFormationDeadline.toISOString()} />
                  </div>
                </div>
                
                {userTeam && teamProject && (
                  <div>
                    <h3 className="font-medium mb-3">Upcoming Deadlines</h3>
                    {teamProject.deliverables
                      .filter(
                        (d) =>
                          d.status !== "approved" && new Date(d.dueDate) > new Date()
                      )
                      .sort(
                        (a, b) =>
                          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                      )
                      .slice(0, 3)
                      .map((deliverable) => (
                        <div
                          key={deliverable.id}
                          className="mb-3 bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <h4 className="font-medium">{deliverable.title}</h4>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                          </p>
                          <Badge
                            className={
                              deliverable.status === "submitted"
                                ? "mt-2 bg-blue-100 text-blue-800"
                                : deliverable.status === "needs_changes"
                                ? "mt-2 bg-yellow-100 text-yellow-800"
                                : "mt-2 bg-gray-100 text-gray-800"
                            }
                          >
                            {deliverable.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    
                    {teamProject.deliverables.filter(
                      (d) => d.status !== "approved" && new Date(d.dueDate) > new Date()
                    ).length === 0 && (
                      <p className="text-sm text-gray-500">No upcoming deadlines</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mentor Dashboard View
  if (currentUser.role === "mentor") {
    const mentorTeams = teams.filter((team) => team.mentorId === currentUser.id);
    
    const pendingReviews = mentorTeams.flatMap((team) => {
      const teamProject = projects.find((p) => p.teamId === team.id);
      if (!teamProject) return [];
      
      return teamProject.deliverables
        .filter((d) => d.status === "submitted")
        .map((deliverable) => ({
          id: deliverable.id,
          title: deliverable.title,
          teamName: team.name,
          projectId: teamProject.id,
          submittedAt: deliverable.submittedAt,
        }));
    });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back, {currentUser.name}</CardTitle>
              <CardDescription>
                Manage your assigned teams and review submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Assigned Teams */}
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-projexia-600 mr-2" />
                      <h3 className="font-medium">Your Assigned Teams</h3>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/mentorship")}
                    >
                      View All
                    </Button>
                  </div>
                  
                  {mentorTeams.length > 0 ? (
                    <div className="mt-3 divide-y">
                      {mentorTeams
                        .slice(0, 3)
                        .map((team) => (
                          <div key={team.id} className="py-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{team.name}</h4>
                              <Badge className="bg-projexia-100 text-projexia-800">
                                {team.memberIds.length} members
                              </Badge>
                            </div>
                            <Button
                              variant="link"
                              className="p-0 h-auto text-projexia-600"
                              onClick={() => navigate(`/teams/${team.id}`)}
                            >
                              View Team
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">
                      You haven't been assigned to any teams yet.
                    </p>
                  )}
                </div>
                
                {/* Pending Reviews */}
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <ClipboardCheck className="h-5 w-5 text-projexia-600 mr-2" />
                      <h3 className="font-medium">Pending Reviews</h3>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/mentorship")}
                    >
                      View All
                    </Button>
                  </div>
                  
                  {pendingReviews.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {pendingReviews
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-3 rounded border border-gray-200"
                          >
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-600">
                              Team: {item.teamName} • Submitted:{" "}
                              {new Date(item.submittedAt || "").toLocaleDateString()}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              <Button
                                className="bg-projexia-600 hover:bg-projexia-700"
                                size="sm"
                                onClick={() => navigate(`/projects/${item.projectId}`)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">
                      No pending reviews at this time.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-projexia-600 mr-2" />
                <CardTitle>Activity & Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/mentorship")}
                    >
                      View Mentorship Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/teams")}
                    >
                      Browse All Teams
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/projects")}
                    >
                      View Projects
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Recent Activity</h3>
                  <ul className="space-y-3">
                    {mentorTeams.flatMap((team) => {
                      const teamProject = projects.find((p) => p.teamId === team.id);
                      if (!teamProject) return [];
                      
                      return teamProject.deliverables
                        .slice(0, 3)
                        .map((deliverable) => ({
                          id: `${teamProject.id}-${deliverable.id}`,
                          teamName: team.name,
                          deliverableTitle: deliverable.title,
                          status: deliverable.status,
                          date: deliverable.updatedAt || deliverable.submittedAt || deliverable.dueDate,
                        }));
                    }).length > 0 ? (
                      mentorTeams
                        .flatMap((team) => {
                          const teamProject = projects.find((p) => p.teamId === team.id);
                          if (!teamProject) return [];
                          
                          return teamProject.deliverables
                            .slice(0, 3)
                            .map((deliverable) => ({
                              id: `${teamProject.id}-${deliverable.id}`,
                              teamName: team.name,
                              deliverableTitle: deliverable.title,
                              status: deliverable.status,
                              date: deliverable.updatedAt || deliverable.submittedAt || deliverable.dueDate,
                            }));
                        })
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((activity) => (
                          <li
                            key={activity.id}
                            className="text-sm border-l-2 border-projexia-300 pl-3 py-1"
                          >
                            <p className="font-medium">
                              {activity.deliverableTitle}{" "}
                              <Badge
                                variant="outline"
                                className={
                                  activity.status === "approved"
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : activity.status === "submitted"
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : activity.status === "needs_changes"
                                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                    : "bg-gray-50 border-gray-200 text-gray-700"
                                }
                              >
                                {activity.status.replace("_", " ")}
                              </Badge>
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.teamName} • {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </li>
                        ))
                    ) : (
                      <li className="text-sm text-gray-500 text-center">
                        No recent activity
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin Dashboard View
  if (currentUser.role === "admin") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hello, {currentUser.name}</CardTitle>
            <CardDescription>
              System overview and admin controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-gray-500 text-sm">Total Teams</h3>
                <p className="text-3xl font-bold mt-1">{teams.length}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-gray-500 text-sm">Total Projects</h3>
                <p className="text-3xl font-bold mt-1">{projects.length}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-gray-500 text-sm">Unassigned Teams</h3>
                <p className="text-3xl font-bold mt-1">
                  {teams.filter((team) => !team.mentorId).length}
                </p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-projexia-600 mr-2" />
                  <h3 className="font-medium">Team Management</h3>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/teams")}
                  >
                    View All Teams
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin")}
                  >
                    Assign Mentors
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <ClipboardCheck className="h-5 w-5 text-projexia-600 mr-2" />
                  <h3 className="font-medium">Project Supervision</h3>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/projects")}
                  >
                    View All Projects
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin")}
                  >
                    Manage Deadlines
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                className="bg-projexia-600 hover:bg-projexia-700"
                onClick={() => navigate("/admin")}
              >
                Go to Admin Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default Dashboard;
