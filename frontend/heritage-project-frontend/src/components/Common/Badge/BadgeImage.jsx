import { AspectRatio } from "@/components/ui/aspect-ratio"

function BadgeImage({badgeImage}) {
  return (
    <div className="badgeImageDiv">
        <AspectRatio ratio={1 / 1}>
            <img
                src= {badgeImage}
                alt="Badge Image"
                className="badgeImage"
            />
        </AspectRatio>
    </div>
  )
}

export default BadgeImage;