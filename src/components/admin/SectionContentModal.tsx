import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SectionContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | undefined;
  isLoading: boolean;
  videoUrl?: string;
  onVideoUrlSave?: (videoUrl: string) => Promise<void>;
  sectionId?: string;
}

const SectionContentModal: React.FC<SectionContentModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  isLoading,
  videoUrl = '',
  onVideoUrlSave,
  sectionId
}) => {
  const [videoUrlInput, setVideoUrlInput] = useState(videoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Update local state when props change
  useEffect(() => {
    setVideoUrlInput(videoUrl || '');
  }, [videoUrl]);

  // Convert Google Drive URL to embed format
  const getGoogleDriveEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Handle different Google Drive URL formats
    if (url.includes('drive.google.com/file/d/')) {
      // Format: https://drive.google.com/file/d/FILE_ID/view
      const fileId = url.split('/file/d/')[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal&disableExtensions=true&hl=en`;
    } else if (url.includes('drive.google.com/open?id=')) {
      // Format: https://drive.google.com/open?id=FILE_ID
      const fileId = url.split('open?id=')[1].split('&')[0];
      return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal&disableExtensions=true&hl=en`;
    }
    // If it's already an embed URL, add security parameters
    if (url.includes('/preview')) {
      return url.includes('?') ? `${url}&rm=minimal&disableExtensions=true&hl=en` : `${url}?rm=minimal&disableExtensions=true&hl=en`;
    }
    // Return original URL with security parameters
    return url;
  };

  const handleSaveVideoUrl = async () => {
    if (!onVideoUrlSave) return;
    
    try {
      setIsSaving(true);
      await onVideoUrlSave(videoUrlInput);
      toast.success("Video URL saved successfully");
      // Switch to video tab to show preview after saving
      setActiveTab('video');
    } catch (error) {
      console.error("Error saving video URL:", error);
      toast.error("Failed to save video URL");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Section content and video
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Video URL Input Field */}
          <div className="mb-6 space-y-2">
            <Label htmlFor="videoUrl">Google Drive Video URL</Label>
            <div className="flex gap-2">
              <Input
                id="videoUrl"
                placeholder="Paste Google Drive video link here"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                disabled={isSaving}
              />
              <Button 
                onClick={handleSaveVideoUrl} 
                disabled={isSaving || !onVideoUrlSave}
              >
                {isSaving ? <Spinner className="h-4 w-4 mr-2" /> : null}
                Save URL
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Videos will be unlocked when students reach this section.
            </p>
          </div>
          
          {/* Tabs for Content and Video Preview */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="video" disabled={!videoUrlInput}>Video Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              {/* Content Display */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8 text-[#8A63FF]" />
                  <span className="ml-2">Loading content...</span>
                </div>
              ) : content ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No content available for this section.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="video">
              {videoUrlInput ? (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    src={getGoogleDriveEmbedUrl(videoUrlInput)}
                    className="w-full h-[450px] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={title}
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    referrerPolicy="no-referrer"
                  ></iframe>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No video URL provided. Add a Google Drive video URL above.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SectionContentModal; 