import ProfileContainer from "./ProfileContainer";
import Badge from "@/components/Common/Badge/Badge";
import api from "../../../services/api";
import { useState, useEffect } from "react";

function BadgeContainer({username}) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get(`/website/another_badges/${username}`);
        console.log("API badges response:", response.data)
        setBadges(response.data);
      } catch (error) {
        console.error("Error geting badges:", error)
      }
    };

    fetchBadges();
  }, [username]);

  if (!badges) {
      return (
        <ProfileContainer title={"Badges"} itemsPerRow={3}>
        </ProfileContainer>
      )
  }

  return (
    <ProfileContainer title={"Badges"} itemsPerRow={3}>
        {badges && badges.map((badge) => (
          <Badge
          size="lg"
            key={badge.badge.title}
            title={badge.badge.title}
            image={badge.badge.image}
            description={badge.badge.description}
          />
        ))}
    </ProfileContainer>
  )
}

export default BadgeContainer;