
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
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
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";
import { Project, ProjectStatus } from "@/types";

const statusColors: Record<ProjectStatus, string> = {
  planning: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
};

const Projects = () => {
  const { currentUser } = useAuth();
  const { projects } = useProject();
  const { getUserTeam } = useTeam();
  const navigate = useNavigate();
  
  // If user is a student, show only their team's project
  // If user is a mentor, show projects of teams they mentor
  // If user is an admin, show all projects
  const filteredProjects = projects.filter((project) => {
    if (!currentUser) return false;
    
    if (currentUser.role === "student") {
      const userTeam = getUserTeam(currentUser.id);
      return userTeam ? project.teamId === userTeam.id : false;
    }
    
    // For now, mentors and admins see all projects
    // In a real app, we would filter based on mentor assignments
    return true;
  });

  const getProjectProgress = (project: Project) => {
    const totalDeliverables = project.deliverables.length;
    if (totalDeliverables === 0) return 0;
    
    const completedDeliverables = project.deliverables.filter(
      (d) => d.status === "approved"
    ).length;
    
    return Math.round((completedDeliverables / totalDeliverables) * 100);
  };

  return (
    <PageLayout
      title="Projects"
      subtitle="Manage and track your academic projects"
    >
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge className={statusColors[project.status]}>
                    {statusLabels[project.status]}
                  </Badge>
                </div>
                <CardDescription>
                  Team Project • Created {new Date(project.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {project.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{getProjectProgress(project)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-projexia-600 h-2 rounded-full"
                      style={{ width: `${getProjectProgress(project)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Deliverables</h4>
                  <ul className="mt-2 space-y-1">
                    {project.deliverables.slice(0, 2).map((deliverable) => (
                      <li key={deliverable.id} className="text-sm flex justify-between">
                        <span className="truncate">{deliverable.title}</span>
                        <Badge
                          variant="outline"
                          className={
                            deliverable.status === "approved"
                              ? "border-green-500 text-green-700"
                              : deliverable.status === "submitted"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-gray-300 text-gray-700"
                          }
                        >
                          {deliverable.status}
                        </Badge>
                      </li>
                    ))}
                    {project.deliverables.length > 2 && (
                      <li className="text-xs text-gray-500">
                        +{project.deliverables.length - 2} more deliverables
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-projexia-600 hover:bg-projexia-700"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-500 mb-6">
            {currentUser?.role === "student"
              ? "Join or create a team to start working on projects"
              : "There are no projects to display at this time"}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/teams")}
          >
            Browse Teams
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export default Projects;
