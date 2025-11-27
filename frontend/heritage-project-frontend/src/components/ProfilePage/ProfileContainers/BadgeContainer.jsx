import ProfileContainer from "./ProfileContainer";
import Badge from "@/components/Common/Badge/Badge";
import api from "../../../services/api";
import { useState, useEffect } from "react";

function BadgeContainer() {
  const getBadges = () => {
    const badges = api.get("/website/badges/")
  }

  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get("/website/badges/");
        console.log("API badges response:", response.data)
        setBadges(response.data);
      } catch (error) {
        console.error("Error geting badges:", error)
      }
    };

    fetchBadges();
  }, []);

  return (
    <ProfileContainer title={"Badges"} itemsPerRow={3}>
        {badges && badges.map((badge) => (
          <Badge
            key={badge.title}
            title={badge.title}
            image={badge.image}
          />
        ))}
    </ProfileContainer>
  )
}

export default BadgeContainer;