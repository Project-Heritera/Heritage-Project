import { AspectRatio } from "@/components/ui/aspect-ratio"

function ProfileImage({profileImage}) {
  return (
    <div className="profileImageContainer">
        <AspectRatio ratio={1 / 1}>
            <img
                src= {profileImage}
                alt="User Profile"
                className="profileImage"
            />
        </AspectRatio>
    </div>
  )
}

export default ProfileImage;