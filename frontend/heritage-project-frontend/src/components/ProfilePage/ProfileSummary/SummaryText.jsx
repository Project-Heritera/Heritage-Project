function SummaryText({title, value}) {
  return (
    <div className="summaryDiv">
        <h2 className="summaryValue ">{value}</h2>
        <p className="summaryTitle">{title}</p>
    </div>
  )
}

export default SummaryText;