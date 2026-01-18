import ProfileContainer from "./ProfileContainer";
import api from "../../../services/api";
import { useState, useEffect } from "react";
import ConnectionProfile from "./ConnectionsComponets/ConnectionProfile";

function ConnectionsContainer({ username }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await api.get(`/accounts/friends/${username}/`);
        console.log("API connections response:", response.data.friends);
        setConnections(response.data.friends);
      } catch (error) {
        console.error("Error geting badges:", error);
      }
    };

    fetchConnections();
  }, [username]);

  if (!connections) {
    return (
      <ProfileContainer
        title={"Connections"}
        itemsPerRow={3}
      ></ProfileContainer>
    );
  }

  return (
    <ProfileContainer title={"Connections"} itemsPerRow={3}>
      {connections &&
        connections.map((connection) => (
          <ConnectionProfile
            username={connection.username}
            key={connection.username}
            picUrl={`${import.meta.env.VITE_API_URL}${connection.profile_pic}`}
          ></ConnectionProfile>
        ))}
    </ProfileContainer>
  );
}

export default ConnectionsContainer;
