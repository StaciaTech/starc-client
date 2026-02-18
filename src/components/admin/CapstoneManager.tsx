import React, { useState, useEffect } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus, Edit, Trash2, FileCode } from "lucide-react";
import {
  CapstoneProject,
  getCapstoneProjects,
  createCapstoneProject,
  updateCapstoneProject,
  deleteCapstoneProject,
} from "@/services/capstoneService";
import { toast } from "sonner";

interface CapstoneManagerProps {
  courseId: string;
}

const CapstoneManager: React.FC<CapstoneManagerProps> = ({ courseId }) => {
  const [projects, setProjects] = useState<CapstoneProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CapstoneProject | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technicalRequirements: "", // Textarea, generic split by newline
    submissionGuidelines: "",
    variantNumber: 1,
  });

  useEffect(() => {
    fetchProjects();
  }, [courseId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getCapstoneProjects(courseId);
      setProjects(data);
    } catch (err) {
      console.error("Error fetching capstone projects:", err);
      setError("Failed to load capstone projects.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      technicalRequirements: "",
      submissionGuidelines: "",
      variantNumber: projects.length + 1,
    });
    setSelectedProject(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEditClick = (project: CapstoneProject) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technicalRequirements: project.technicalRequirements.join("\n"),
      submissionGuidelines: project.submissionGuidelines,
      variantNumber: project.variantNumber,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (project: CapstoneProject) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Title and Description are required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        technicalRequirements: formData.technicalRequirements
          .split("\n")
          .filter((line) => line.trim() !== ""),
        submissionGuidelines: formData.submissionGuidelines,
        variantNumber: Number(formData.variantNumber),
      };

      if (selectedProject) {
        // Update
        const updated = await updateCapstoneProject(selectedProject._id, payload);
        setProjects(
          projects.map((p) => (p._id === updated._id ? updated : p)),
        );
        toast.success("Capstone project updated successfully");
      } else {
        // Create
        const created = await createCapstoneProject(courseId, payload);
        setProjects([...projects, created]);
        toast.success("Capstone project created successfully");
      }
      setDialogOpen(false);
    } catch (err: any) {
      console.error("Error saving capstone project:", err);
      toast.error(err.response?.data?.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      setSubmitting(true);
      await deleteCapstoneProject(selectedProject._id);
      setProjects(projects.filter((p) => p._id !== selectedProject._id));
      toast.success("Capstone project deleted successfully");
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting capstone project:", err);
      toast.error("Failed to delete project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Capstone Projects
          </h2>
          <p className="text-gray-500 text-sm">
            Manage capstone project variants for this course.
          </p>
        </div>
        <Button onClick={handleCreateClick} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <FileCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            No Capstone Projects
          </h3>
          <p className="text-gray-500 mb-4">
            Create a capstone project for students to complete at the end of the
            course.
          </p>
          <Button onClick={handleCreateClick} variant="outline">
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">Variant #{project.variantNumber}</span>
                        <CardTitle className="mt-2 text-lg">{project.title}</CardTitle>
                    </div>
                </div>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(project)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(project)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Edit Capstone Project" : "New Capstone Project"}
            </DialogTitle>
            <DialogDescription>
              Define the requirements and guidelines for this project variant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="variantNumber" className="text-right">Variant #</Label>
              <Input
                id="variantNumber"
                type="number"
                value={formData.variantNumber}
                onChange={(e) =>
                  setFormData({ ...formData, variantNumber: Number(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="requirements" className="text-right mt-2">
                Tech Requirements
                <span className="block text-xs text-gray-500 font-normal">
                  (One per line)
                </span>
              </Label>
              <Textarea
                id="requirements"
                value={formData.technicalRequirements}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technicalRequirements: e.target.value,
                  })
                }
                className="col-span-3 min-h-[100px]"
                placeholder="- React.js\n- MongoDB\n- Authentication"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="guidelines" className="text-right mt-2">
                Submission Guidelines
              </Label>
              <Textarea
                id="guidelines"
                value={formData.submissionGuidelines}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    submissionGuidelines: e.target.value,
                  })
                }
                className="col-span-3 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this capstone project? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CapstoneManager;
