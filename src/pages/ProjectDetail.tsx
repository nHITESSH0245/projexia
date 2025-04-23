
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageLayout from "@/components/PageLayout";
import { Deliverable, DeliverableStatus } from "@/types";

const deliverableStatusColors: Record<DeliverableStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  needs_changes: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
};

const StatusBadge = ({ status }: { status: DeliverableStatus }) => (
  <Badge className={deliverableStatusColors[status]}>
    {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
  </Badge>
);

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getProjectById, addDeliverable, updateDeliverableStatus, submitDeliverable } = useProject();
  
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [newStatus, setNewStatus] = useState<DeliverableStatus>("pending");
  const [feedback, setFeedback] = useState("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  
  const project = id ? getProjectById(id) : undefined;
  
  if (!project) {
    return (
      <PageLayout title="Project Not Found">
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
        </div>
      </PageLayout>
    );
  }
  
  const handleAddDeliverable = async () => {
    if (!id || !newTitle || !newDueDate) return;
    
    try {
      await addDeliverable(id, {
        title: newTitle,
        description: newDescription,
        dueDate: new Date(newDueDate).toISOString(),
        status: "pending",
      });
      
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding deliverable:", error);
    }
  };
  
  const handleUpdateStatus = async () => {
    if (!id || !selectedDeliverable) return;
    
    try {
      await updateDeliverableStatus(
        id,
        selectedDeliverable.id,
        newStatus,
        feedback
      );
      
      setSelectedDeliverable(null);
      setNewStatus("pending");
      setFeedback("");
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  
  const handleSubmitDeliverable = async () => {
    if (!id || !selectedDeliverable || !fileUrl) return;
    
    try {
      await submitDeliverable(id, selectedDeliverable.id, fileUrl);
      
      setSelectedDeliverable(null);
      setFileUrl("");
      setIsSubmitDialogOpen(false);
    } catch (error) {
      console.error("Error submitting deliverable:", error);
    }
  };
  
  const canEditStatus = currentUser?.role === "mentor" || currentUser?.role === "admin";
  const canAddDeliverable = currentUser?.role === "mentor" || currentUser?.role === "admin";
  const canSubmitDeliverable = currentUser?.role === "student";

  return (
    <PageLayout title={project.title} subtitle="Project details and deliverables">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Project Details</CardTitle>
                <StatusBadge status={project.status as DeliverableStatus} />
              </div>
              <CardDescription>
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{project.description}</p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Project Timeline</h3>
                  
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-6">
                      {project.deliverables
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .map((deliverable) => (
                          <div key={deliverable.id} className="relative pl-10">
                            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-projexia-600 bg-white flex items-center justify-center">
                              {deliverable.status === "approved" ? (
                                <div className="w-3 h-3 rounded-full bg-projexia-600"></div>
                              ) : deliverable.status === "submitted" ? (
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                              ) : null}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <div>
                                <h4 className="text-base font-medium">{deliverable.title}</h4>
                                <p className="text-sm text-gray-500">
                                  Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <StatusBadge status={deliverable.status} />
                            </div>
                            
                            <p className="mt-1 text-sm text-gray-600">{deliverable.description}</p>
                            
                            {deliverable.feedback && (
                              <div className="mt-2 p-2 bg-gray-50 border border-gray-100 rounded text-sm">
                                <p className="font-medium text-xs text-gray-500">Feedback:</p>
                                <p className="text-gray-600">{deliverable.feedback}</p>
                              </div>
                            )}
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                              {canEditStatus && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDeliverable(deliverable);
                                    setNewStatus(deliverable.status);
                                    setFeedback(deliverable.feedback || "");
                                    setIsStatusDialogOpen(true);
                                  }}
                                >
                                  Update Status
                                </Button>
                              )}
                              
                              {canSubmitDeliverable && deliverable.status !== "approved" && (
                                <Button
                                  size="sm"
                                  className="bg-projexia-600 hover:bg-projexia-700"
                                  onClick={() => {
                                    setSelectedDeliverable(deliverable);
                                    setFileUrl(deliverable.fileUrl || "");
                                    setIsSubmitDialogOpen(true);
                                  }}
                                >
                                  {deliverable.status === "submitted" || deliverable.status === "needs_changes"
                                    ? "Update Submission"
                                    : "Submit"}
                                </Button>
                              )}
                              
                              {deliverable.fileUrl && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-projexia-600"
                                  onClick={() => window.open(deliverable.fileUrl, "_blank")}
                                >
                                  View Submission
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              {canAddDeliverable && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-projexia-600 hover:bg-projexia-700">
                      Add Deliverable
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a new deliverable</DialogTitle>
                      <DialogDescription>
                        Create a new project deliverable with due date and requirements.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Project Synopsis"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe requirements for this deliverable"
                          rows={3}
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-projexia-600 hover:bg-projexia-700"
                        onClick={handleAddDeliverable}
                      >
                        Add Deliverable
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>
                      {Math.round(
                        (project.deliverables.filter((d) => d.status === "approved").length /
                          Math.max(project.deliverables.length, 1)) *
                          100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-projexia-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.round(
                          (project.deliverables.filter((d) => d.status === "approved").length /
                            Math.max(project.deliverables.length, 1)) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-3">Deliverables Status</h4>
                  <div className="space-y-2">
                    {Object.keys(
                      project.deliverables.reduce((acc, deliverable) => {
                        acc[deliverable.status] = (acc[deliverable.status] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map((status) => (
                      <div key={status} className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${
                              status === "approved"
                                ? "bg-green-500"
                                : status === "submitted"
                                ? "bg-blue-500"
                                : status === "needs_changes"
                                ? "bg-yellow-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <span>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                          </span>
                        </div>
                        <span>
                          {
                            project.deliverables.filter((d) => d.status === status)
                              .length
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Upcoming Deadlines</h4>
                  <ul className="space-y-2">
                    {project.deliverables
                      .filter((d) => d.status !== "approved" && new Date(d.dueDate) > new Date())
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .slice(0, 3)
                      .map((deliverable) => (
                        <li key={deliverable.id} className="text-sm">
                          <div className="font-medium">{deliverable.title}</div>
                          <div className="text-gray-500">
                            Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                          </div>
                        </li>
                      ))}
                    {project.deliverables.filter(
                      (d) => d.status !== "approved" && new Date(d.dueDate) > new Date()
                    ).length === 0 && (
                      <li className="text-sm text-gray-500">No upcoming deadlines</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Deliverable Status</DialogTitle>
            <DialogDescription>
              Change the status and provide feedback for the selected deliverable.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-base font-medium">
                {selectedDeliverable?.title}
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Current Status: {selectedDeliverable?.status.replace("_", " ")}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as DeliverableStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="needs_changes">Needs Changes</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback to the team"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-projexia-600 hover:bg-projexia-700"
              onClick={handleUpdateStatus}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Submit Deliverable Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Deliverable</DialogTitle>
            <DialogDescription>
              Upload your work for the deliverable: {selectedDeliverable?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                placeholder="Enter URL to your submitted file (Google Drive, GitHub, etc.)"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Please provide a link to your file hosted on a cloud storage service.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-projexia-600 hover:bg-projexia-700"
              onClick={handleSubmitDeliverable}
              disabled={!fileUrl.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ProjectDetail;
