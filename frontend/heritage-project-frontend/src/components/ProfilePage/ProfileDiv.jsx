// This page is the render for the home page at the root
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card"
function ProfileDiv({children}) {
  return (
    <Card>
        <CardContent>
          {children}
        </CardContent>
    </Card>
  )
}

export default ProfileDiv;