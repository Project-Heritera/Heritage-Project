function SummaryText({title, value}) {
  return (
    <div className="profileDescriptionDiv">
        <h2 className="profileName w-1/2 ">{value}</h2>

        <p className="profileDescription">{title}</p>
    </div>
  )
}

export default SummaryText;