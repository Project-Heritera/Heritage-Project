import React, { useState } from 'react'
import ProfileDiv from '../ProfileDiv'
import { Button } from '@/components/ui/button'

function ProfileContainer({children, title, itemsPerRow}) {
    const gridColsClass = `lg:grid-cols-${itemsPerRow}`

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
        <div className='flex justify-between'>
            <h2 className='text-lg font-bold'>{title}</h2>
            {/* Only display view all if we have an overflow */}
            {overflow && (
                <Button variant="link" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? 'Close' : 'View All'}
                </Button>
            )}
        </div>
        {/* Display desired children */}
        <div className="flex justify-center">
            <div className={`inline-grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-4`}>
            {viewableChildren}
        </div>
        </div>
    </ProfileDiv>
  )
}

export default ProfileContainer;