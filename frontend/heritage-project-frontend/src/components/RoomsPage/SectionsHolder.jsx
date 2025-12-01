//Handle what the buttons look like for toolbar
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
const SectionsHolder = ({ children }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    View your learning path
                </CardTitle>
            </CardHeader>

            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
};

export default SectionsHolder;