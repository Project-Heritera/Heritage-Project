import ProfileContainer from "./ProfileContainer";
import api from "../../../services/api";
import { useState, useEffect } from "react";
import ConnectionProfile from "./ConnectionsComponets/ConnectionProfile";

function ConnectionsContainer({username}) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await api.get(``);
        console.log("API connections response:", response.data)
         setConnections(response.data);
      } catch (error) {
        console.error("Error geting badges:", error)
      }
    };

    //fetchConnections();
  }, []);

  if (!connections) {
      return <div>Loading...</div>;
  }

  return (
    <ProfileContainer title={"Connections"} itemsPerRow={3}>
        <ConnectionProfile username={"Harry Potter"} picUrl={"https://github.com/shadcn.png"}/>
        <ConnectionProfile username={"Harry Potter Frances acapone lenuiser"} picUrl={"https://github.com/shadcn.png"}/>
    </ProfileContainer>
  )
}

export default ConnectionsContainer;