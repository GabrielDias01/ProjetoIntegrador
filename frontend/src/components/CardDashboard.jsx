function CardDashboard({
  titulo,
  valor
}) {

  return (

    <div
      className="card border-0 shadow-sm p-3"
      style={{
        borderRadius: "14px"
      }}
    >

      <small
        style={{
          color: "#64748b"
        }}
      >
        {titulo}
      </small>

      <h2 className="fw-bold mt-2">
        {valor}
      </h2>

    </div>

  )

}

export default CardDashboard