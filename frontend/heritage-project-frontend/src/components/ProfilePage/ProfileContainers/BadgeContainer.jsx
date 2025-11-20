import ProfileContainer from "./ProfileContainer";
import Badge from "@/components/Common/Badge/Badge";
import api from "../../../services/api"

function BadgeContainer() {
  const getBadges = () => {
    const badges = api.get("/website/badges/")
  }
  return (
    <ProfileContainer title={"Badges"} itemsPerRow={2}>
        {console.log(getBadges())}
        <Badge image={"http://localhost:5173/testimage.jpg"}/>
        <Badge image={"http://localhost:5173/testimage.jpg"}/>
        <Badge image={"http://localhost:5173/testimage.jpg"}/>
    </ProfileContainer>
  )
}

export default BadgeContainer;