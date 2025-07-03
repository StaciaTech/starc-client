import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for our component
interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface Subchapter {
  id: string;
  title: string;
  description: string;
  order: number;
  sections: Section[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  subchapters: Subchapter[];
}

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chapter: Chapter) => Promise<void>;
  chapterOrder: number;
}

const AddChapterModal: React.FC<AddChapterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  chapterOrder
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chapter, setChapter] = useState<Chapter>({
    id: uuidv4(),
    title: '',
    description: '',
    order: chapterOrder,
    subchapters: [
      {
        id: uuidv4(),
        title: '',
        description: '',
        order: 0,
        sections: [
          {
            id: uuidv4(),
            title: '',
            description: '',
            order: 0
          }
        ]
      }
    ]
  });

  // Handle chapter title and description changes
  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChapter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle subchapter changes
  const handleSubchapterChange = (subchapterIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChapter(prev => {
      const updatedSubchapters = [...prev.subchapters];
      updatedSubchapters[subchapterIndex] = {
        ...updatedSubchapters[subchapterIndex],
        [name]: value
      };
      return {
        ...prev,
        subchapters: updatedSubchapters
      };
    });
  };

  // Handle section changes
  const handleSectionChange = (subchapterIndex: number, sectionIndex: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setChapter(prev => {
      const updatedSubchapters = [...prev.subchapters];
      const updatedSections = [...updatedSubchapters[subchapterIndex].sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        [name]: value
      };
      updatedSubchapters[subchapterIndex] = {
        ...updatedSubchapters[subchapterIndex],
        sections: updatedSections
      };
      return {
        ...prev,
        subchapters: updatedSubchapters
      };
    });
  };

  // Add a new subchapter
  const addSubchapter = () => {
    setChapter(prev => ({
      ...prev,
      subchapters: [
        ...prev.subchapters,
        {
          id: uuidv4(),
          title: '',
          description: '',
          order: prev.subchapters.length,
          sections: [
            {
              id: uuidv4(),
              title: '',
              description: '',
              order: 0
            }
          ]
        }
      ]
    }));
  };

  // Remove a subchapter
  const removeSubchapter = (index: number) => {
    if (chapter.subchapters.length <= 1) {
      toast.error('A chapter must have at least one subchapter');
      return;
    }
    
    setChapter(prev => {
      const updatedSubchapters = prev.subchapters.filter((_, i) => i !== index);
      // Update order of remaining subchapters
      updatedSubchapters.forEach((subchapter, i) => {
        subchapter.order = i;
      });
      return {
        ...prev,
        subchapters: updatedSubchapters
      };
    });
  };

  // Add a new section to a subchapter
  const addSection = (subchapterIndex: number) => {
    setChapter(prev => {
      const updatedSubchapters = [...prev.subchapters];
      const updatedSections = [
        ...updatedSubchapters[subchapterIndex].sections,
        {
          id: uuidv4(),
          title: '',
          description: '',
          order: updatedSubchapters[subchapterIndex].sections.length
        }
      ];
      updatedSubchapters[subchapterIndex] = {
        ...updatedSubchapters[subchapterIndex],
        sections: updatedSections
      };
      return {
        ...prev,
        subchapters: updatedSubchapters
      };
    });
  };

  // Remove a section from a subchapter
  const removeSection = (subchapterIndex: number, sectionIndex: number) => {
    if (chapter.subchapters[subchapterIndex].sections.length <= 1) {
      toast.error('A subchapter must have at least one section');
      return;
    }
    
    setChapter(prev => {
      const updatedSubchapters = [...prev.subchapters];
      const updatedSections = updatedSubchapters[subchapterIndex].sections.filter((_, i) => i !== sectionIndex);
      // Update order of remaining sections
      updatedSections.forEach((section, i) => {
        section.order = i;
      });
      updatedSubchapters[subchapterIndex] = {
        ...updatedSubchapters[subchapterIndex],
        sections: updatedSections
      };
      return {
        ...prev,
        subchapters: updatedSubchapters
      };
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!chapter.title.trim()) {
      toast.error('Chapter title is required');
      return;
    }

    // Check if all subchapters have titles
    const invalidSubchapter = chapter.subchapters.find(subchapter => !subchapter.title.trim());
    if (invalidSubchapter) {
      toast.error('All subchapters must have titles');
      return;
    }

    // Check if all sections have titles
    let allSectionsValid = true;
    chapter.subchapters.forEach(subchapter => {
      subchapter.sections.forEach(section => {
        if (!section.title.trim()) {
          allSectionsValid = false;
        }
      });
    });

    if (!allSectionsValid) {
      toast.error('All sections must have titles');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(chapter);
      toast.success('Chapter added successfully');
      onClose();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error('Failed to add chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Chapter</DialogTitle>
          <DialogDescription>
            Create a new chapter with subchapters and sections for this course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chapter details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-base font-semibold">Chapter Title</Label>
              <Input
                id="title"
                name="title"
                value={chapter.title}
                onChange={handleChapterChange}
                placeholder="Enter chapter title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-base font-semibold">Chapter Description</Label>
              <Textarea
                id="description"
                name="description"
                value={chapter.description}
                onChange={handleChapterChange}
                placeholder="Enter chapter description"
                className="mt-1"
              />
            </div>
          </div>

          {/* Subchapters */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Subchapters</h3>
              <Button 
                onClick={addSubchapter} 
                variant="outline" 
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Subchapter
              </Button>
            </div>

            {chapter.subchapters.map((subchapter, subchapterIndex) => (
              <Card key={subchapter.id} className="mb-4 border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">Subchapter {subchapterIndex + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubchapter(subchapterIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <Label htmlFor={`subchapter-${subchapterIndex}-title`}>Title</Label>
                      <Input
                        id={`subchapter-${subchapterIndex}-title`}
                        name="title"
                        value={subchapter.title}
                        onChange={(e) => handleSubchapterChange(subchapterIndex, e)}
                        placeholder="Enter subchapter title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`subchapter-${subchapterIndex}-description`}>Description</Label>
                      <Textarea
                        id={`subchapter-${subchapterIndex}-description`}
                        name="description"
                        value={subchapter.description}
                        onChange={(e) => handleSubchapterChange(subchapterIndex, e)}
                        placeholder="Enter subchapter description"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Sections */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Sections</h4>
                      <Button 
                        onClick={() => addSection(subchapterIndex)} 
                        variant="ghost" 
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Section
                      </Button>
                    </div>

                    {subchapter.sections.map((section, sectionIndex) => (
                      <div key={section.id} className="border rounded-md p-3 mb-2 bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm">Section {sectionIndex + 1}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(subchapterIndex, sectionIndex)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <Label htmlFor={`section-${subchapterIndex}-${sectionIndex}-title`} className="text-xs">Title</Label>
                            <Input
                              id={`section-${subchapterIndex}-${sectionIndex}-title`}
                              name="title"
                              value={section.title}
                              onChange={(e) => handleSectionChange(subchapterIndex, sectionIndex, e)}
                              placeholder="Enter section title"
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`section-${subchapterIndex}-${sectionIndex}-description`} className="text-xs">Description</Label>
                            <Textarea
                              id={`section-${subchapterIndex}-${sectionIndex}-description`}
                              name="description"
                              value={section.description}
                              onChange={(e) => handleSectionChange(subchapterIndex, sectionIndex, e)}
                              placeholder="Enter section description"
                              className="mt-1 text-sm min-h-[60px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-[#8A63FF] hover:bg-[#7A53EF]"
          >
            {isSubmitting ? 'Adding...' : 'Add Chapter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddChapterModal; 