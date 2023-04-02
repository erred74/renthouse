export default function Alert({type, heading, message}) {
  return (
      <>
          <div className={"alert alert-"+type} role="alert">
              <h4 className="alert-heading">{heading}</h4>
              <p>{message}</p>
          </div>
      </>
  )
}