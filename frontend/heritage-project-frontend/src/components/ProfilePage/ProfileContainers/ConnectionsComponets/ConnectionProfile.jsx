import {Avatar, AvatarImage} from "../../../ui/avatar"
import { Link } from "react-router-dom";
import {Card, CardContent, CardTitle, CardDescription} from "../../../ui/card"

function ConnectionProfile({username, picUrl}) {
  return (
    <Link to={`/u/${username}`}>
      <Card className="group w-46 h-50 hover:bg-slate-50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-6" >
          <Avatar className="h-24 w-24 shrink-0">
            <AvatarImage src={picUrl}/>
          </Avatar>

          <span className="font-semibold text-lg group-hover:underline w-full text-center truncate px-2">
            {username}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default ConnectionProfile;