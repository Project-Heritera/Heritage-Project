import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image } from "@radix-ui/react-avatar";
import { Navigate, useNavigate } from "react-router-dom";
import { useErrorStore } from "@/stores/ErrorStore";
import { publish_room } from "@/services/room";
import { Debug } from "@/utils/debugLog";

BadgeAward.propTypes = {
  badge_title: PropTypes.string.isRequired,
  badge_image_url: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

function BadgeAward({ badge_title, badge_image_url, onClose }) {
  const navigate = useNavigate();

 

  return (
    <div className="p-6 text-center shadow-lg">
      <CardHeader>
        <CardTitle className="text-green-600 text-xl font-bold">
          Congratulations!
        </CardTitle>
      </CardHeader>

      <CardHeader>
        <CardContent>
          <Avatar>
            <AvatarImage src={badge_image_url} className="rounded-full max-w-44 max-h-44 mx-auto"/>
            <AvatarFallback>Badge Icon</AvatarFallback>
          </Avatar>
        </CardContent>
      </CardHeader>
      <CardHeader>
        <CardDescription>You Earned A Badge For {badge_title}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        <Button
          variant="destructive"
          onClick={onClose}
        >
          Return To Course Page
        </Button>
      </CardFooter>
      </div>
  );
}

export default BadgeAward;
