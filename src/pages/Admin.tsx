
import { useState } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { Team, User } from "@/types";

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "student",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Dr. Robert Johnson",
    email: "robert@example.com",
    role: "mentor",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Prof. Emily Wilson",
    email: "emily@example.com",
    role: "mentor",
    createdAt: new Date().toISOString(),
  },
];

const Admin = () => {
  const { currentUser } = useAuth();
  const { teams, getTeamById, assignMentorToTeam } = useTeam();
  const { projects } = useProject();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");

  // Security check - only admin should access this page
  if (!currentUser || currentUser.role !== "admin") {
    navigate("/");
    return null;
  }

  // Filter users by role
  const students = MOCK_USERS.filter((user) => user.role === "student");
  const mentors = MOCK_USERS.filter((user) => user.role === "mentor");

  // Students not in any team
  const unteamedStudents = students.filter(
    (student) => !teams.some((team) => team.memberIds.includes(student.id))
  );

  const handleAssignMentor = async () => {
    if (!selectedTeam || !selectedMentorId) {
      toast({
        title: "Error",
        description: "Please select both a team and a mentor",
        variant: "destructive",
      });
      return;
    }

    try {
      await assignMentorToTeam(selectedTeam.id, selectedMentorId);
      setSelectedTeam(null);
      setSelectedMentorId("");
      toast({
        title: "Success",
        description: `Mentor successfully assigned to ${selectedTeam.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign mentor to team",
        variant: "destructive",
      });
    }
  };

  const handleAssignStudentToTeam = (studentId: string, teamId: string) => {
    // This would be implemented to assign an unteamed student to a team
    toast({
      title: "Feature Coming Soon",
      description: "This feature is not implemented in the demo",
    });
  };

  return (
    <PageLayout
      title="Admin Dashboard"
      subtitle="Manage teams, mentors, and projects"
    >
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>All Teams</CardTitle>
                  <CardDescription>
                    Overview of all teams and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team Name</TableHead>
                          <TableHead>Members</TableHead>
                          <TableHead>Mentor</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teams.length > 0 ? (
                          teams.map((team) => {
                            const project = projects.find((p) => p.teamId === team.id);
                            return (
                              <TableRow key={team.id}>
                                <TableCell className="font-medium">
                                  {team.name}
                                </TableCell>
                                <TableCell>
                                  {team.memberIds.length} / 5
                                </TableCell>
                                <TableCell>
                                  {team.mentorId ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      Assigned
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Unassigned</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {project ? (
                                    <span className="text-xs truncate max-w-[120px] inline-block">
                                      {project.title}
                                    </span>
                                  ) : (
                                    <Badge variant="outline">No Project</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="text-projexia-600 p-0 h-auto"
                                    onClick={() => navigate(`/teams/${team.id}`)}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center text-muted-foreground"
                            >
                              No teams found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Assign Mentor</CardTitle>
                  <CardDescription>
                    Assign a mentor to a team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Team</label>
                      <Select
                        value={selectedTeam?.id || ""}
                        onValueChange={(teamId) => {
                          const team = getTeamById(teamId);
                          setSelectedTeam(team || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams
                            .filter((team) => !team.mentorId)
                            .map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Mentor</label>
                      <Select
                        value={selectedMentorId}
                        onValueChange={setSelectedMentorId}
                        disabled={!selectedTeam}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mentor" />
                        </SelectTrigger>
                        <SelectContent>
                          {mentors.map((mentor) => (
                            <SelectItem key={mentor.id} value={mentor.id}>
                              {mentor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleAssignMentor}
                    className="w-full bg-projexia-600 hover:bg-projexia-700"
                    disabled={!selectedTeam || !selectedMentorId}
                  >
                    Assign Mentor
                  </Button>
                </CardFooter>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Unteamed Students</CardTitle>
                  <CardDescription>
                    Students not assigned to any team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {unteamedStudents.length > 0 ? (
                    <ul className="space-y-2">
                      {unteamedStudents.map((student) => (
                        <li
                          key={student.id}
                          className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                        >
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Assign
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      All students are assigned to teams
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  All registered students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Team</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const studentTeam = teams.find((team) =>
                          team.memberIds.includes(student.id)
                        );
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              {studentTeam ? (
                                <span>{studentTeam.name}</span>
                              ) : (
                                <Badge variant="outline">Unassigned</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mentors</CardTitle>
                <CardDescription>
                  All faculty mentors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teams</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mentors.map((mentor) => {
                        const mentorTeams = teams.filter(
                          (team) => team.mentorId === mentor.id
                        );
                        return (
                          <TableRow key={mentor.id}>
                            <TableCell className="font-medium">
                              {mentor.name}
                            </TableCell>
                            <TableCell>{mentor.email}</TableCell>
                            <TableCell>
                              {mentorTeams.length > 0 ? (
                                <Badge className="bg-projexia-100 text-projexia-800">
                                  {mentorTeams.length} teams
                                </Badge>
                              ) : (
                                <Badge variant="outline">No teams</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                Overview of all team projects and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deliverables</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.length > 0 ? (
                      projects.map((project) => {
                        const team = getTeamById(project.teamId);
                        const approvedDeliverables = project.deliverables.filter(
                          (d) => d.status === "approved"
                        ).length;
                        const totalDeliverables = project.deliverables.length;
                        const progress = totalDeliverables > 0
                          ? Math.round((approvedDeliverables / totalDeliverables) * 100)
                          : 0;
                        
                        return (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">
                              {project.title}
                            </TableCell>
                            <TableCell>{team?.name || "Unknown Team"}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  project.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : project.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {project.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {approvedDeliverables} / {totalDeliverables}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-full max-w-[80px] h-2 bg-gray-200 rounded-full">
                                  <div
                                    className="h-2 bg-projexia-600 rounded-full"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="link"
                                size="sm"
                                className="text-projexia-600 p-0 h-auto"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No projects found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Admin;
