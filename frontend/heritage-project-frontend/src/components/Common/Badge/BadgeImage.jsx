import { AspectRatio } from "@/components/ui/aspect-ratio"

function BadgeImage({badgeImage}) {
  return (
    <div className="w-[100%] mb-2">
        <AspectRatio ratio={1 / 1}>
            <img
                src= {badgeImage}
                alt="Badge Image"
                className="rounded-md object-cover w-full h-full"
            />
        </AspectRatio>
    </div>
  )
}

export default BadgeImage;