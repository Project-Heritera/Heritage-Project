import ProfileDiv from "./ProfileDiv";
import ProfileImage from "./ProfileImage"
import ProfileDescription from "./ProfileDescription";

function ProfileDisplay() {
  return (
    <ProfileDiv>
      <ProfileImage profileImage={"http://localhost:5173/testimage.jpg"}/>
      <ProfileDescription name={"Harry Potter"} description={"Lorem ipsum llorem ipsum"}></ProfileDescription>
    </ProfileDiv>
  )
}

export default ProfileDisplay;