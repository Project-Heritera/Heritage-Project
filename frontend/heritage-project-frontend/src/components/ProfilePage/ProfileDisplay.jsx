import ProfileDiv from "./ProfileDiv";
import ProfileImage from "./ProfileImage"
import ProfileDescription from "./ProfileDescription";
import ProfileSummary from "./ProfileSummary/ProfileSummary";

function ProfileDisplay() {
  return (
    <ProfileDiv>
      <div className="profileDisplayDiv">
        <ProfileImage profileImage={"http://localhost:5173/testimage.jpg"}/>
        <div className="profileDisplayInfoDiv">
          <ProfileDescription name={"Harry Potter"} description={"Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum"}></ProfileDescription>
          <ProfileSummary></ProfileSummary>
        </div>
      </div>
    </ProfileDiv>
  )
}

export default ProfileDisplay;