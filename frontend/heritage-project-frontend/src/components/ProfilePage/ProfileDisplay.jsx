import ProfileDiv from "./ProfileDiv";
import ProfileImage from "./ProfileImage"
import ProfileDescription from "./ProfileDescription";
import ProfileSummary from "./ProfileSummary/ProfileSummary";
import ProfileDropDown from "./ProfileDropdown"
import ConnectionButton from "./ConnectionButton";
import EditButton from "./EditButton";
import ProfileTitle from "./ProfileTitle"
import ProfileEdit from "./ProfileEdit";
import { useState } from "react";

function ProfileDisplay({ profImage, name, description, isOwner }) {
  const editProfile = () => console.log("Editing profile")

  //Add label and function (action) for dropdown menu buttons
  const dropDownMenu = [
    { label: "Edit Profile", action: editProfile }
  ]

  const [currentBio, setCurrentBio] = useState(description);
  const [currentImageUrl, setCurrentImageUrl] = useState(profImage);

  return (
    <ProfileDiv>
      <div className="profileDisplayDiv">
        <ProfileImage profileImage={currentImageUrl} />
        <div className="profileDisplayInfoDiv">
          <div className="flex flex-col ">
            {/* Actions and Title div*/}
            <div className="flex items-center">
              <ProfileTitle username={"Harry Potter"} />
              {/* Display actions*/}
              <div className="ml-auto">
                <ProfileEdit currentBio={currentBio} currentImageUrl={currentImageUrl} setCurrentBio={setCurrentBio} setCurrentImageUrl={setCurrentImageUrl}/>
                <ProfileDropDown items={dropDownMenu} menuTitle={"My Profile"} />
              </div>
            </div>
            {/* Display Description and profile summaries*/}
            <div className="text-left">
              <ProfileDescription description={currentBio}></ProfileDescription>
            </div>
          </div>
          <ProfileSummary></ProfileSummary>
        </div>
        <div className="self-start flex">
        </div>
      </div>
    </ProfileDiv>
  )
}

export default ProfileDisplay;