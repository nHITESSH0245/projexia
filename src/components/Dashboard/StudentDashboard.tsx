import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NotificationsPanel from "./NotificationsPanel";
import { ClipboardCheck, Users, User } from "lucide-react";
import AddMemberDialog from "../AddMemberDialog";

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { getUserTeam, teams, isLoading, teams: allTeams, setTeams } = useTeam();
  const { projects } = useProject();
  if (!currentUser) return null;

  const team = getUserTeam(currentUser.id);
  const project = team ? projects.find(p => p.teamId === team.id) : undefined;
  const formationDeadline = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  const handleAddMember = async (email: string) => {
    const user = [{ id: "1", email: "student@example.com" }].find(
      u => u.email === email
    );
    if (!user) {
      throw new Error("No student with that email found.");
    }
    if (!team) {
      throw new Error("No team found.");
    }
    if (team.memberIds.includes(user.id)) {
      throw new Error("Student is already a member of your team.");
    }
    alert("Demo: Member added! (not persistent)");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome Header */}
        <Card>
          <CardHeader>
            <CardTitle>Hi {currentUser.name}, ready to build something awesome?</CardTitle>
          </CardHeader>
        </Card>

        {/* Team Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-projexia-600" />
              <CardTitle>Team Status</CardTitle>
            </div>
            <CardDescription>
              {team
                ? `Team: ${team.name}`
                : "You're not part of a team yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {team ? (
              <div>
                <div className="flex flex-wrap gap-3 mb-2">
                  {team.memberIds.map((id) => {
                    const member = teams.flatMap((t) => t.memberIds).includes(id)
                      ? teams.find((t) => t.memberIds.includes(id))?.name
                      : id;
                    return (
                      <span
                        className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"
                        key={id}
                      >
                        {member}
                      </span>
                    );
                  })}
                </div>
                <div className="flex gap-2 mb-2">
                  <AddMemberDialog onAdd={handleAddMember} />
                </div>
                <div className="text-sm text-gray-500">
                  Team formation deadline: {formationDeadline.toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button className="bg-projexia-600" size="sm">
                  Create Team
                </Button>
                <Button variant="outline" size="sm">
                  Join Team
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentor Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-projexia-600" />
              <CardTitle>Mentor Info</CardTitle>
            </div>
            <CardDescription>
              {team?.mentorId ? "Assigned Mentor" : "No mentor assigned yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {team?.mentorId ? (
              <div>
                <span className="font-medium">{team.mentorId}</span>
                <p className="text-sm text-gray-500">Email: mentor@email.edu</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Message Mentor
                </Button>
              </div>
            ) : (
              <span className="text-gray-400">Mentor info unavailable</span>
            )}
          </CardContent>
        </Card>

        {/* Project Submission Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-projexia-600" />
              <CardTitle>Project Submission Timeline</CardTitle>
            </div>
            <CardDescription>
              Upcoming deliverables and submission status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project && project.deliverables?.length > 0 ? (
              <ul className="space-y-2">
                {project.deliverables.slice(0, 3).map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between p-2 bg-gray-100 rounded"
                  >
                    <span className="font-medium">{d.title}</span>
                    <span className="text-xs text-gray-700">
                      Due: {new Date(d.dueDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-300">
                      {d.status}
                    </span>
                    <Button size="sm" className="ml-2" variant="outline">
                      Upload
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">No upcoming deliverables</span>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Notifications Panel */}
      <div>
        <NotificationsPanel />
      </div>
    </div>
  );
};

export default StudentDashboard;
