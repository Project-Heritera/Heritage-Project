import ProfileDiv from "./ProfileDiv";
import ProfileImage from "./ProfileImage"
import ProfileDescription from "./ProfileDescription";
import ProfileSummary from "./ProfileSummary/ProfileSummary";

function ProfileDisplay() {
  return (
    <ProfileDiv>
      <div className="flex gap-x-8">
        <ProfileImage profileImage={"http://localhost:5173/testimage.jpg"}/>
        <div className="flex flex-col justify-between flex-1">
          <ProfileDescription name={"Harry Potter"} description={"Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum"}></ProfileDescription>
          <ProfileSummary></ProfileSummary>
        </div>
      </div>
    </ProfileDiv>
  )
}

export default ProfileDisplay;