import ProfileContainer from "./ProfileContainer";
import Badge from "@/components/Common/Badge/Badge";

function BadgeContainer() {
  return (
    <ProfileContainer title={"Badges"} itemsPerRow={2}>
        <Badge image={"http://localhost:5173/testimage.jpg"}/>
        <Badge image={"http://localhost:5173/testimage.jpg"}/>
        <Badge image={"http://localhost:5173/testimage.jpg"}/>
    </ProfileContainer>
  )
}

export default BadgeContainer;