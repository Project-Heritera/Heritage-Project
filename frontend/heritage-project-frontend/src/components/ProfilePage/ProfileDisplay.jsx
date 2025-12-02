import ProfileDiv from "./ProfileDiv";
import ProfileImage from "./ProfileImage"
import ProfileDescription from "./ProfileDescription";
import ProfileSummary from "./ProfileSummary/ProfileSummary";
import ProfileDropDown from "./ProfileDropdown"
import ConnectionButton from "./ConnectionButton";
import EditButton from "./EditButton";
import ProfileTitle from "./ProfileTitle"
import ProfileEdit from "./ProfileEdit";
import { useState, useEffect } from "react";

function ProfileDisplay({ profImage, name, description, isOwner, viewUser }) {
  const editProfile = () => console.log("Editing profile")
  console.log("Description recieved is: ", description)

  //Add label and function (action) for dropdown menu buttons
  const dropDownMenu = [
    { label: "Edit Profile", action: editProfile },
  ]

  const [currentBio, setCurrentBio] = useState(description);
  const [currentImageUrl, setCurrentImageUrl] = useState(profImage);

  useEffect(() => {
     setCurrentBio(description);
     setCurrentImageUrl(profImage);
  }, [description, profImage]);

  return (
    <ProfileDiv>
      <div className="profileDisplayDiv">
        <ProfileImage profileImage={currentImageUrl} />
        <div className="profileDisplayInfoDiv">
          <div className="flex flex-col ">
            {/* Actions and Title div*/}
            <div className="flex items-center">
              <ProfileTitle username={name} />
              {/* Display actions*/}
              <div className="ml-auto">
                {/* Handle whats displayed if users page is the owners*/}
                {isOwner ? (
                  //Viewing as owner
                  <ProfileEdit currentBio={currentBio} currentImageUrl={currentImageUrl} setCurrentBio={setCurrentBio} setCurrentImageUrl={setCurrentImageUrl} />
                ) : (
                  //Viewing as outside viewer
                  <ConnectionButton viewUser={viewUser} pageUser={name}/>
                )}
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