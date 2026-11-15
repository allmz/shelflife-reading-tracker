// One component for the loading, error and empty states, reused on
// every page with different props.

function StateMessage({ title, text, tone = '', role }) {
  return (
    <div className={`state-message ${tone}`} role={role}>
      <span className="state-dot" />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default StateMessage;
