import ProfileDiv from "./ProfileDiv";
import ProfileImage from "./ProfileImage"
import ProfileDescription from "./ProfileDescription";
import ProfileSummary from "./ProfileSummary/ProfileSummary";

function ProfileDisplay({profImage, name, description}) {
  return (
    <ProfileDiv>
      <div className="profileDisplayDiv">
        <ProfileImage profileImage={profImage}/>
        <div className="profileDisplayInfoDiv">
          <ProfileDescription name={name} description={description}></ProfileDescription>
          <ProfileSummary></ProfileSummary>
        </div>
      </div>
    </ProfileDiv>
  )
}

export default ProfileDisplay;