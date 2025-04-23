
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";

const Mentorship = () => {
  const { currentUser } = useAuth();
  const { teams } = useTeam();
  const { projects } = useProject();
  const navigate = useNavigate();

  // Security check - only mentors should access this page
  if (!currentUser || currentUser.role !== "mentor") {
    navigate("/");
    return null;
  }

  // Get teams assigned to this mentor
  const mentorTeams = teams.filter((team) => team.mentorId === currentUser.id);

  // Get pending reviews (submitted deliverables that haven't been approved or rejected)
  const pendingReviews = mentorTeams.flatMap((team) => {
    const teamProject = projects.find((p) => p.teamId === team.id);
    if (!teamProject) return [];
    
    return teamProject.deliverables
      .filter((d) => d.status === "submitted")
      .map((deliverable) => ({
        deliverable,
        project: teamProject,
        team,
      }));
  });

  return (
    <PageLayout
      title="Mentorship Dashboard"
      subtitle="Manage your assigned teams and project reviews"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>
                Deliverables awaiting your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReviews.length > 0 ? (
                <ul className="space-y-4">
                  {pendingReviews.map(({ deliverable, project, team }) => (
                    <li
                      key={deliverable.id}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{deliverable.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Team: {team.name} • Project: {project.title}
                          </p>
                          <p className="text-sm mt-2">{deliverable.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-blue-50 border-blue-200">
                              Submitted: {new Date(deliverable.submittedAt || "").toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline" className="bg-yellow-50 border-yellow-200">
                              Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          className="bg-projexia-600 hover:bg-projexia-700"
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          Review
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending reviews at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>My Teams</CardTitle>
              <CardDescription>
                Teams assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mentorTeams.length > 0 ? (
                <ul className="space-y-3">
                  {mentorTeams.map((team) => {
                    const teamProject = projects.find((p) => p.teamId === team.id);
                    return (
                      <li
                        key={team.id}
                        className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{team.name}</h3>
                            <p className="text-xs text-gray-500">
                              {team.memberIds.length} Members
                              {teamProject && ` • Project: ${teamProject.title}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-projexia-600"
                            onClick={() => navigate(`/teams/${team.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No teams assigned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your teams
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Mentorship;
