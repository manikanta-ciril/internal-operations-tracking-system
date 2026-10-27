export default function Panel({ title, children, action, className = "" }) {
  return (
    <section className={"panel " + className}>
      <div className="section-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
