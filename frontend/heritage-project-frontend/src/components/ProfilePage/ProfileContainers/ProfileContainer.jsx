import React, { useState } from 'react'
import ProfileDiv from '../ProfileDiv'
import { Button } from '@/components/ui/button'

function ProfileContainer({children, title, itemsPerRow}) {
    const gridColsClass = `md:grid-cols-${itemsPerRow}`

    //make state for view all button
    const [isOpen, setIsOpen] = useState(false)
    //make children into array to make easier to mess with
    const childrenArray = React.Children.toArray(children)

    //Check if we even need the view all button
    const overflow = childrenArray.length > itemsPerRow

    //Get the children to show based on if isOpen is set to true or not
    const viewableChildren = isOpen ? childrenArray : childrenArray.slice(0, itemsPerRow)
    
  return (
    <ProfileDiv>
        {/* Display the view all button and Title*/}
        <div className='profileContainerDiv'>
            <h2 className='profileContainerTitle'>{title}</h2>
            {/* Only display view all if we have an overflow */}
            {overflow && (
                <Button variant="link" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? 'Close' : 'View All'}
                </Button>
            )}
        </div>
        {/* Display desired children */}
        <div className="profileContainerChildrenDiv">
            <div className={`inline-grid grid-cols-1 ${gridColsClass} gap-4`}>
            {viewableChildren}
        </div>
        </div>
    </ProfileDiv>
  )
}

export default ProfileContainer;