import ProfileDisplay from "../components/ProfilePage/ProfileDisplay";
import BadgeContainer from "@/components/ProfilePage/ProfileContainers/BadgeContainer";


function Profile() {
  return (
    <div>
      <ProfileDisplay profImage={"http://localhost:5173/testimage.jpg"} name={"Harry Potter"} description={"Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum"}/>
      <BadgeContainer/>
    </div>
  )
}

export default Profile;