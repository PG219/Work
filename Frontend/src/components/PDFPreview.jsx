import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, ExternalLink, X } from 'lucide-react';

const PDFPreview = ({ attachment, attachmentInfo, fileName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    if (attachment) {
      const link = document.createElement('a');
      link.href = attachment;
      link.download = attachmentInfo?.originalName || fileName || 'attachment.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (attachment) {
      window.open(attachment, '_blank');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!attachment) return null;

  return (
    <div className="mt-2">
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {attachmentInfo?.originalName || fileName || 'attachment.pdf'}
                </p>
                {attachmentInfo?.size && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachmentInfo.size)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Preview PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                  <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-500" />
                        {attachmentInfo?.originalName || fileName || 'attachment.pdf'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 p-4">
                    {isLoading && (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Loading PDF...</p>
                        </div>
                      </div>
                    )}
                    <iframe
                      src={attachment}
                      className="w-full h-[70vh] border-0 rounded"
                      onLoad={() => setIsLoading(false)}
                      title="PDF Preview"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleDownload}
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleOpenInNewTab}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFPreview;
