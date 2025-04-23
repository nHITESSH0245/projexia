
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Project, Deliverable, DeliverableStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  createProject: (title: string, description: string, teamId: string) => Promise<Project>;
  getProjectById: (projectId: string) => Project | undefined;
  getTeamProject: (teamId: string) => Project | undefined;
  addDeliverable: (projectId: string, deliverable: Omit<Deliverable, "id">) => Promise<void>;
  updateDeliverableStatus: (projectId: string, deliverableId: string, status: DeliverableStatus, feedback?: string) => Promise<void>;
  submitDeliverable: (projectId: string, deliverableId: string, fileUrl: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Mock projects for demo
const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "AI-Driven Customer Service Platform",
    description: "Developing an AI-powered platform to automate customer service interactions",
    teamId: "1",
    status: "in_progress",
    createdAt: new Date().toISOString(),
    deliverables: [
      {
        id: "1",
        title: "Project Synopsis",
        description: "Initial project description and goals",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: "submitted",
        submittedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Initial Presentation",
        description: "Presentation of project scope and methodology",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        status: "pending",
      },
    ],
  },
];

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching projects from API
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch projects from an API
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Using our mock data for now
        setProjects(MOCK_PROJECTS);
      } catch (error) {
        console.error("Error loading projects:", error);
        toast({
          title: "Error",
          description: "Could not load projects. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [toast]);

  const createProject = async (
    title: string,
    description: string,
    teamId: string
  ): Promise<Project> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Check if team already has a project
      const existingProject = projects.find((p) => p.teamId === teamId);
      if (existingProject) {
        throw new Error("This team already has a project");
      }
      
      const newProject: Project = {
        id: (projects.length + 1).toString(),
        title,
        description,
        teamId,
        status: "planning",
        createdAt: new Date().toISOString(),
        deliverables: [],
      };
      
      setProjects((prevProjects) => [...prevProjects, newProject]);
      
      toast({
        title: "Project created",
        description: `Project "${title}" has been created successfully`,
      });
      
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create project",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectById = (projectId: string) => {
    return projects.find((project) => project.id === projectId);
  };

  const getTeamProject = (teamId: string) => {
    return projects.find((project) => project.teamId === teamId);
  };

  const addDeliverable = async (
    projectId: string,
    deliverable: Omit<Deliverable, "id">
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Find the project
      const projectIndex = projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) {
        throw new Error("Project not found");
      }
      
      const project = projects[projectIndex];
      
      // Create new deliverable
      const newDeliverable: Deliverable = {
        ...deliverable,
        id: (project.deliverables.length + 1).toString(),
      };
      
      // Add deliverable to project
      const updatedProject = {
        ...project,
        deliverables: [...project.deliverables, newDeliverable],
      };
      
      setProjects((prevProjects) => 
        prevProjects.map((p) => (p.id === projectId ? updatedProject : p))
      );
      
      toast({
        title: "Deliverable added",
        description: `"${deliverable.title}" has been added to the project`,
      });
    } catch (error) {
      console.error("Error adding deliverable:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not add deliverable",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliverableStatus = async (
    projectId: string,
    deliverableId: string,
    status: DeliverableStatus,
    feedback?: string
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Find the project
      const projectIndex = projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) {
        throw new Error("Project not found");
      }
      
      const project = projects[projectIndex];
      
      // Find the deliverable
      const deliverableIndex = project.deliverables.findIndex(
        (d) => d.id === deliverableId
      );
      if (deliverableIndex === -1) {
        throw new Error("Deliverable not found");
      }
      
      // Update deliverable
      const updatedDeliverables = [...project.deliverables];
      updatedDeliverables[deliverableIndex] = {
        ...updatedDeliverables[deliverableIndex],
        status,
        feedback: feedback || updatedDeliverables[deliverableIndex].feedback,
        updatedAt: new Date().toISOString(),
      };
      
      // Update project
      const updatedProject = {
        ...project,
        deliverables: updatedDeliverables,
      };
      
      setProjects((prevProjects) => 
        prevProjects.map((p) => (p.id === projectId ? updatedProject : p))
      );
      
      toast({
        title: "Status updated",
        description: `Deliverable status updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating deliverable status:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not update status",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitDeliverable = async (
    projectId: string,
    deliverableId: string,
    fileUrl: string
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Find the project
      const projectIndex = projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) {
        throw new Error("Project not found");
      }
      
      const project = projects[projectIndex];
      
      // Find the deliverable
      const deliverableIndex = project.deliverables.findIndex(
        (d) => d.id === deliverableId
      );
      if (deliverableIndex === -1) {
        throw new Error("Deliverable not found");
      }
      
      // Update deliverable
      const updatedDeliverables = [...project.deliverables];
      updatedDeliverables[deliverableIndex] = {
        ...updatedDeliverables[deliverableIndex],
        status: "submitted",
        fileUrl,
        submittedAt: new Date().toISOString(),
      };
      
      // Update project
      const updatedProject = {
        ...project,
        deliverables: updatedDeliverables,
      };
      
      setProjects((prevProjects) => 
        prevProjects.map((p) => (p.id === projectId ? updatedProject : p))
      );
      
      toast({
        title: "Deliverable submitted",
        description: "Your deliverable has been submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting deliverable:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not submit deliverable",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        createProject,
        getProjectById,
        getTeamProject,
        addDeliverable,
        updateDeliverableStatus,
        submitDeliverable,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
