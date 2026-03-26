import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Edit, Trash2, AlertCircle, RefreshCw, FileText, X } from "lucide-react";
import { getComments, saveComment, updateComment, deleteComment } from "@/services/commentService";
import PDFPreview from "@/components/PDFPreview";

const Comments = ({ projectId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [editFile, setEditFile] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Function to fetch comments from the API
  const fetchComments = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getComments(projectId);
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchComments();
    }
  }, [projectId]);

  // Function to handle file selection
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed as attachments.');
        return;
      }
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  // Function to handle edit file selection
  const handleEditFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed as attachments.');
        return;
      }
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setEditFile(selectedFile);
      setError(null);
    }
  };

  // Function to clear file selection
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to clear edit file selection
  const clearEditFile = () => {
    setEditFile(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  // Function to handle posting a new comment
  const handlePostComment = async () => {
    if (newComment.trim() === "" || isPosting) {
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      await saveComment(projectId, newComment, file);
      
      // Clear the input fields after successful post
      setNewComment(""); 
      clearFile();

      // Re-fetch the comments to get the updated list
      await fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError(error.message);
    } finally {
      setIsPosting(false);
    }
  };

  // Function to handle editing a comment
  const handleEditComment = async (commentId) => {
    if (editText.trim() === "" || isPosting) {
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      await updateComment(commentId, editText, editFile);
      
      // Clear editing state
      setEditingComment(null);
      setEditText("");
      clearEditFile();

      // Re-fetch the comments
      await fetchComments();
    } catch (error) {
      console.error("Failed to update comment:", error);
      setError(error.message);
    } finally {
      setIsPosting(false);
    }
  };

  // Function to handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      await deleteComment(commentId);
      
      // Re-fetch the comments
      await fetchComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setError(error.message);
    } finally {
      setIsPosting(false);
    }
  };

  // Function to start editing a comment
  const startEditing = (comment) => {
    setEditingComment(comment.commentId);
    setEditText(comment.text);
    setEditFile(null);
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingComment(null);
    setEditText("");
    clearEditFile();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Comments</h1>
          <p className="text-muted-foreground">Add new comments and view previous conversations.</p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Comment Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add a New Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-4"
              rows={4}
              disabled={isPosting}
            />
            
            {/* File Upload Section */}
            <div className="mb-4">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachment (PDF only, max 10MB)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="flex-1"
                  disabled={isPosting}
                />
                {file && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFile}
                    disabled={isPosting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {file && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Only PDF files are allowed as attachments
              </div>
              <Button 
                onClick={handlePostComment} 
                disabled={newComment.trim() === "" || isPosting}
              >
                {isPosting ? 'Posting...' : 'Post'}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Comments Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Previous Comments</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchComments}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.commentId || comment._id}>
                  <CardContent className="p-4">
                    {editingComment === comment.commentId ? (
                      // Edit mode
                      <div className="space-y-3">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="mb-2"
                          rows={3}
                        />
                        
                        {/* Edit File Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Update Attachment (PDF only, max 10MB)
                          </label>
                          <div className="flex items-center gap-2">
                            <Input
                              ref={editFileInputRef}
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleEditFileSelect}
                              className="flex-1"
                              disabled={isPosting}
                            />
                            {editFile && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={clearEditFile}
                                disabled={isPosting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {editFile && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">{editFile.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(editFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment.commentId)}
                            disabled={editText.trim() === "" || isPosting}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={isPosting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">
                            {comment.author?.name || "Unknown Author"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(comment)}
                              disabled={isPosting}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteComment(comment.commentId)}
                              disabled={isPosting}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">
                          {comment.text}
                        </p>
                        
                        {/* PDF Preview Component */}
                        {comment.attachment && (
                          <PDFPreview
                            attachment={comment.attachment}
                            attachmentInfo={comment.attachmentInfo}
                            fileName={comment.attachmentInfo?.originalName}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
