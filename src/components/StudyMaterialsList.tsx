import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ExternalLink, File, Link as LinkIcon } from 'lucide-react';
import { IStudyMaterial, getStudyMaterials } from '@/services/studyMaterialService';

interface StudyMaterialsListProps {
  courseId: string;
}

export default function StudyMaterialsList({ courseId }: StudyMaterialsListProps) {
  const [materials, setMaterials] = useState<IStudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await getStudyMaterials(courseId);
      setMaterials(data);
      setError('');
    } catch (err) {
      setError('Failed to load study materials');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'file' ? <File className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner className="h-8 w-8 border-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No study materials available for this course.
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Study Materials</CardTitle>
        <CardDescription>Additional resources to help you master the course content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {materials.map((material) => (
            <Card key={material._id} className="overflow-hidden">
              <div className="p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(material.type)}
                    <h3 className="font-medium">{material.title}</h3>
                  </div>
                  {material.description && (
                    <p className="text-sm text-gray-500 mt-1">{material.description}</p>
                  )}
                </div>
                <div>
                  {material.type === 'link' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(material.content, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Link
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(material.content, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <File className="h-4 w-4" />
                      View File
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 