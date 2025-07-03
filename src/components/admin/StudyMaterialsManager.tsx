import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  File, 
  Link, 
  Trash, 
  Pencil, 
  MoveUp, 
  MoveDown,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  IStudyMaterial, 
  getAllStudyMaterials, 
  createStudyMaterial, 
  updateStudyMaterial, 
  deleteStudyMaterial,
  reorderStudyMaterials
} from '@/services/studyMaterialService';

interface StudyMaterialsManagerProps {
  courseId: string;
}

export default function StudyMaterialsManager({ courseId }: StudyMaterialsManagerProps) {
  const [materials, setMaterials] = useState<IStudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<IStudyMaterial> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'file' | 'link'>('link');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await getAllStudyMaterials(courseId);
      setMaterials(data);
      setError('');
    } catch (err) {
      setError('Failed to load study materials');
      toast.error('Failed to load study materials');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('link');
    setContent('');
    setIsPublished(true);
    setCurrentMaterial(null);
    setIsEditing(false);
  };

  const handleOpenDialog = (material?: IStudyMaterial) => {
    if (material) {
      setTitle(material.title);
      setDescription(material.description || '');
      setType(material.type);
      setContent(material.content);
      setIsPublished(material.isPublished);
      setCurrentMaterial(material);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const materialData: Partial<IStudyMaterial> = {
        courseId,
        title,
        description,
        type,
        content,
        isPublished
      };

      if (isEditing && currentMaterial?._id) {
        await updateStudyMaterial(currentMaterial._id, materialData);
      } else {
        await createStudyMaterial(materialData);
      }
      
      fetchMaterials();
      handleCloseDialog();
      toast.success(`Study material ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (err) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} study material`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this study material?')) {
      try {
        await deleteStudyMaterial(id);
        fetchMaterials();
        toast.success('Study material deleted successfully');
      } catch (err) {
        toast.error('Failed to delete study material');
      }
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = materials.findIndex(m => m._id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === materials.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newMaterials = [...materials];
    const [movedItem] = newMaterials.splice(currentIndex, 1);
    newMaterials.splice(newIndex, 0, movedItem);
    
    // Update the UI optimistically
    setMaterials(newMaterials);
    
    // Send the new order to the server
    try {
      await reorderStudyMaterials(courseId, newMaterials.map(m => m._id));
    } catch (err) {
      // Revert to the original order if there's an error
      toast.error('Failed to reorder study materials');
      fetchMaterials();
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'file' ? <File className="h-4 w-4" /> : <Link className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Study Materials</CardTitle>
          <CardDescription>Manage study materials for this course</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>Add Study Material</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">Loading study materials...</div>
        ) : error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : materials.length === 0 ? (
          <div className="text-center p-4">No study materials found. Add your first one!</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material._id}>
                  <TableCell className="font-medium">{material.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(material.type)}
                      <span className="capitalize">{material.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {material.isPublished ? (
                      <Badge variant="default" className="bg-green-500">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {material.type === 'link' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.open(material.content, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReorder(material._id, 'up')}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReorder(material._id, 'down')}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenDialog(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(material._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Study Material' : 'Add Study Material'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value: 'file' | 'link') => setType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">
                    {type === 'link' ? 'URL' : 'File Content/URL'}
                  </Label>
                  <Input
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder={type === 'link' ? 'https://example.com' : 'File URL or content'}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 