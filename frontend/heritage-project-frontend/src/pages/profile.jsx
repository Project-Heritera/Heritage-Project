import ProfileDisplay from "../components/ProfilePage/ProfileDisplay";
import BadgeContainer from "@/components/ProfilePage/ProfileContainers/BadgeContainer";
import { useParams } from "react-router-dom";


function Profile() {
  const {username} = useParams();
  console.log("User is:", username)
  return (
    <div className="flex flex-col gap-6 p-6">
      <ProfileDisplay profImage={"http://localhost:5173/testimage.jpg"} name={"Harry Potter"} description={"Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum"}/>
      <BadgeContainer/>
    </div>
  )
}

export default Profile;