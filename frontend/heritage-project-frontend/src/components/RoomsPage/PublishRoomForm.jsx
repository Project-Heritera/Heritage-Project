import PropTypes from "prop-types";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useErrorStore } from "@/stores/ErrorStore";
import { publish_room } from "@/services/room";
import { Debug } from "@/utils/debugLog";

PublishRoomForm.propTypes = {
  room_id: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

function PublishRoomForm({ room_id, onClose }) {
  const [isPublished, setIsPublished] = useState(false);
  const showError = useErrorStore((state) => state.showError);

  const handlePublish = async () => {
    try {
      await publish_room(room_id); // assumes this service exists and publishes the room
      setIsPublished(true);
    } catch (err) {
      Debug.error("Error publishing room:", err);
      showError("Failed to publish the room");
    }
  };

  return (
    <>
      {isPublished ? (
        <Card className="p-6 text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-600 text-xl font-bold">
              Room Published Successfully!
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="destructive" onClick={onClose}>
              Close
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="p-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Publish Room</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Publishing this room means you cannot make changes until future updates. 
              This room will be available for everyone to see. Are you sure you want to publish it?
            </p>
          </CardContent>

          <CardFooter className="flex justify-between gap-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1" onClick={handlePublish}>
              Publish
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}

export default PublishRoomForm;
