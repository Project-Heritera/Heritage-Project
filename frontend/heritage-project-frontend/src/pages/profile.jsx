import ProfileDisplay from "../components/ProfilePage/ProfileDisplay";
import BadgeContainer from "@/components/ProfilePage/ProfileContainers/BadgeContainer";
import { useParams } from "react-router-dom";
import { USER_NAME } from "@/services/LocalStorage";


function Profile() {
  const {username} = useParams();
  const loggedInUser = localStorage.getItem(USER_NAME);
  console.log("Requested User is:", username)
  console.log("Logged in user:", loggedInUser);

  const isOwner = loggedInUser && loggedInUser === username//Check if viewing your own profile page
  console.log("isOwner?:", isOwner)
  return (
    <div className="flex flex-col gap-6 p-6">
      <ProfileDisplay isOwner={isOwner} profImage={"http://localhost:5173/testimage.jpg"} name={"Harry Potter"} description={"Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum"}/>
      <BadgeContainer/>
    </div>
  )
}

export default Profile;