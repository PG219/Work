import { useState, useEffect } from "react";
import { Play, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { getBackendUrl } from "@/config/env";

const VideoPlayer = ({
  thumbnailSrc,
  title,
  description,
  duration,
  youtubeId, // Optional fallback
  secureVideoEndpoint = "/video/demo", // Backend route to generate Signed URL
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayClick = async () => {
    setIsPlaying(true);
    setIsLoading(true);

    try {
      const res = await axios.get(getBackendUrl("video/demo"));
      setVideoUrl(res.data.url);
    } catch (e) {
      console.error("Failed to load secure video, using fallback:", e);
      setVideoUrl(""); // Will trigger YouTube fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setVideoUrl("");
  };

  return (
    <>
      {/* Thumbnail */}
      <div
        className="relative rounded-lg overflow-hidden group cursor-pointer"
        onClick={handlePlayClick}
      >
        <img
          src={thumbnailSrc}
          alt={title}
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 group-hover:scale-110 transition-transform shadow-xl">
            <Play className="w-12 h-12 text-blue-600" fill="currentColor" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>

        <div className="absolute bottom-4 right-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
          {duration}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isPlaying} onOpenChange={handleClosePlayer}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white z-50"
                onClick={handleClosePlayer}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 p-6 pt-0 overflow-auto">
            <div
              className="relative w-full mb-6 rounded-lg overflow-hidden bg-black"
              style={{ paddingTop: "56.25%" }} // 16:9
            >
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
              )}

              {/* Video Player */}
              <div className="absolute inset-0">
                {!isLoading && videoUrl ? (
                  <video
                    className="w-full h-full object-contain"
                    src={videoUrl}
                    controls
                    autoPlay
                    poster={thumbnailSrc}
                  />
                ) : (
                  !isLoading && (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${
                        youtubeId || "dQw4w9WgXcQ"
                      }?autoplay=1&rel=0&modestbranding=1`}
                      allowFullScreen
                    />
                  )
                )}

                {/* Spinner */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Loader2 className="h-12 w-12 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Details Section (unchanged) */}
            <div className="">
              <h4 className="font-semibold mb-3">What You'll Learn</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Complete AI system inventory and classification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Automated risk assessment and scoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Real-time compliance monitoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Policy management and enforcement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Comprehensive audit reporting
                </li>
              </ul>
            </div>
            {/* CTA */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Ready to Get Started?</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule a personalized demo with our team
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Book Demo
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoPlayer;
