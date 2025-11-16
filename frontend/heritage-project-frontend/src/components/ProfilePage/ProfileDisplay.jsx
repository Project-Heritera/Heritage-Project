import ProfileDiv from "./ProfileDiv";
import ProfileImage from "./ProfileImage"
import ProfileDescription from "./ProfileDescription";
import ProfileSummary from "./ProfileSummary/ProfileSummary";
import ProfileDropDown from "./ProfileDropdown"

function ProfileDisplay({profImage, name, description}) {
  const editProfile = () => console.log("Editing profile")

  //Add label and function (action) for dropdown menu buttons
  const dropDownMenu = [
    {label: "Edit Profile", action: editProfile}
  ]

  return (
    <ProfileDiv>
      <div className="profileDisplayDiv">
        <ProfileImage profileImage={profImage}/>
        <div className="profileDisplayInfoDiv">
          <ProfileDescription name={name} description={description}></ProfileDescription>
          <ProfileSummary></ProfileSummary>
        </div>
        <div className="self-start">
          <ProfileDropDown items={dropDownMenu} menuTitle={"My Profile"}/>
        </div>
      </div>
    </ProfileDiv>
  )
}

export default ProfileDisplay;