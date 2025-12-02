import PropTypes from "prop-types";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

import ReactPlayer from "react-player";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const VideoTaskComponent = forwardRef(({ jsonData, isEditing }, ref) => {
  const [url, setUrl] = useState("");

  useImperativeHandle(ref, () => ({
    serialize: () => {
      return JSON.stringify({
        url: url || "",
      });
    },
  }));

  useEffect(() => {
    if (jsonData) {
      try {
        const parsed = JSON.parse(JSON.stringify(jsonData));
        const { url } = parsed;
        setUrl(url || "");
      } catch (error) {
        console.error("Failed to parse initial video value:", error);
      }
    }
  }, [jsonData]);

  return (
 <Card className="p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
  {isEditing ? (
    <CardHeader className="space-y-4">
      <Input
        placeholder="Video URL (YouTube, .mp4, Vimeo, etc.)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full"
      />

      {url && (
        <div className="relative w-full pt-[56.25%] rounded-md overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <ReactPlayer
            src={url}
            controls
            width="100%"
            height="100%"
            className="absolute top-0 left-0"
          />
        </div>
      )}
    </CardHeader>
  ) : (
    <CardContent className="flex flex-col items-center space-y-4">
      {url && (
        <div className="relative w-full pt-[56.25%] rounded-md overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <ReactPlayer
            src={url}
            controls
            width="100%"
            height="100%"
            className="absolute top-0 left-0"
          />
        </div>
      )}
    </CardContent>
  )}
</Card>

  );
});

VideoTaskComponent.propTypes = {
  jsonData: PropTypes.string,
  isEditing: PropTypes.bool,
};

export default VideoTaskComponent;