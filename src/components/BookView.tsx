import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface BookViewProps {
  driveUrl: string;
  title: string;
  onClose: () => void;
}

const BookView: React.FC<BookViewProps> = ({ driveUrl, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check if URL is a Google Docs link
  const isGoogleDocs = driveUrl.includes('docs.google.com/document');

  // Extract the drive file ID from the URL
  const getDriveFileId = (url: string) => {
    try {
      if (isGoogleDocs) {
        // Handle Google Docs URLs
        const match = url.match(/\/d\/([^/]+)/) || url.match(/\/document\/d\/([^/]+)/);
        return match ? match[1] : null;
      } else {
        // Handle Google Drive URLs
        const fileIdMatch = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
        return fileIdMatch ? fileIdMatch[1] : null;
      }
    } catch (error) {
      console.error("Error extracting Drive file ID:", error);
      return null;
    }
  };

  const fileId = getDriveFileId(driveUrl);
  
  // Create an embedded view URL based on the file type
  const getEmbedUrl = () => {
    if (!fileId) return null;

    if (isGoogleDocs) {
      // Format for Google Docs
      return `https://docs.google.com/document/d/${fileId}/preview`;
    } else {
      // Format for PDF in Google Drive
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  };

  const embedUrl = getEmbedUrl();

  const handleIframeLoad = () => {
    setIsLoading(false);

    // Try to hide the Google Drive expand button using JavaScript
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // We create a style tag to inject into the iframe
        setTimeout(() => {
          // Delay a bit to ensure the iframe has fully loaded
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
              const style = iframeDoc.createElement('style');
              style.textContent = `
                /* Hide the expand button in Google Drive */
                .drive-viewer-toolstrip-inner,
                .ndfHFb-c4YZDc-Wrql6b,
                .ndfHFb-c4YZDc-to915-LgbsSe,
                .ndfHFb-c4YZDc-z5C9Gb-LgbsSe {
                  display: none !important;
                }
                
                /* Hide elements with the 'open in new' icon */
                [aria-label*="open"],
                [aria-label*="Open"],
                [title*="open"],
                [title*="Open"],
                [data-tooltip*="open"],
                [data-tooltip*="Open"] {
                  display: none !important;
                }
                
                /* Hide any popups/dialogs that might show download options */
                .modal-dialog,
                .drive-viewer-popups-dim,
                .drive-viewer-popups-popup {
                  display: none !important;
                }
              `;
              iframeDoc.head.appendChild(style);
            }
          } catch (e) {
            console.log("Cannot access iframe content due to same-origin policy");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error hiding expand button:", error);
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load the document. Please try again later.");
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent scrolling of background content when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div 
          className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col h-[90vh]"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800 truncate">{title}</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden bg-gray-100">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63FF]"></div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-red-500 text-center p-4">
                  <p className="text-lg font-semibold">{error}</p>
                  <p className="mt-2">Please check your internet connection and try again.</p>
                  <Button 
                    variant="default" 
                    className="mt-4 bg-[#8A63FF]" 
                    onClick={() => {
                      setIsLoading(true);
                      setError(null);
                      if (iframeRef.current && embedUrl) {
                        iframeRef.current.src = embedUrl;
                      }
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {embedUrl && (
              <div className="w-full h-full relative">
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className="w-full h-full"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  allow="autoplay"
                  allowFullScreen
                  title={`${title} Viewer`}
                />
                {/* Overlay to block interactions with specific parts of the iframe */}
                <div 
                  className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-default"
                  onClick={(e) => e.preventDefault()}
                />
              </div>
            )}
            
            {!embedUrl && !error && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-gray-600 text-center p-4">
                  <p className="text-lg font-semibold">No valid document URL provided</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Provided by STARC Learning Team
            </p>
            <p className="text-sm text-gray-500">
              © All rights reserved. Not for download or distribution.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookView; 