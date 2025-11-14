function ProfileDescription({name, description}) {
  return (
    <div className="profileDescriptionDiv">
        <h1 className="profileName">{name}</h1>

        <p className="profileDescription">{description}</p>
    </div>
  )
}

export default ProfileDescription;