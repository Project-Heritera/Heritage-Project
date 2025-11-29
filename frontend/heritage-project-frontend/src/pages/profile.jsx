import ProfileDisplay from "../components/ProfilePage/ProfileDisplay";
import BadgeContainer from "@/components/ProfilePage/ProfileContainers/BadgeContainer";
import { useParams } from "react-router-dom";
import { USER_NAME } from "@/services/LocalStorage";
import api from "../services/api"
import { useState, useEffect } from "react";
import ConnectionsContainer from "@/components/ProfilePage/ProfileContainers/ConnectionsContainer";


function Profile() {
  const {username} = useParams();
  const loggedInUser = localStorage.getItem(USER_NAME);

  const [userDataResponse, setUserDataResponse] = useState([]);
 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/accounts/another_user_info/${username}`);
        console.log("API user data response:", response.data)
        setUserDataResponse(response.data);
      } catch (error) {
        console.error("Error geting user data:", error)
      }
    };

    fetchUserData();
  }, []);

  if (!userDataResponse) {
      return <div>Loading...</div>;
  }

  const profPicLink = `${import.meta.env.VITE_API_URL_FOR_TEST}${userDataResponse.profile_pic}`
  const description = userDataResponse.description
  console.log("Description is: ", description)

  const isOwner = loggedInUser && loggedInUser === username//Check if viewing your own profile page
  console.log("isOwner?:", isOwner)
  return (
    <div className="flex flex-col gap-6 p-6">
      <ProfileDisplay isOwner={isOwner} profImage={profPicLink} name={username} description={description} viewUser={loggedInUser}/>
      <BadgeContainer username={username}/>
      <ConnectionsContainer username={username}/>
    </div>
  )
}

export default Profile;