import { AspectRatio } from "@/components/ui/aspect-ratio"

function BadgeImage({badgeImage}) {
  return (
    <div className="profileImageContainer">
        <AspectRatio ratio={1 / 1}>
            <img
                src= {badgeImage}
                alt="Badge Image"
                className="profileImage"
            />
        </AspectRatio>
    </div>
  )
}

export default BadgeImage;