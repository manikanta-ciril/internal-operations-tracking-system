import { useId } from "react";

// Views remain mounted across selection changes so local form state is retained.
export default function Tabs({ label, items, selected, onSelect }) {
  const id = useId();
  const active = items.some((item) => item.id === selected)
    ? selected
    : items[0].id;
  function keys(event) {
    let index = items.findIndex((item) => item.id === active);
    if (event.key === "ArrowRight") index = (index + 1) % items.length;
    else if (event.key === "ArrowLeft")
      index = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") index = 0;
    else if (event.key === "End") index = items.length - 1;
    else return;
    event.preventDefault();
    onSelect(items[index].id);
    document.getElementById(`${id}-tab-${items[index].id}`)?.focus();
  }
  return (
    <div className="profile-browser">
      <div
        className="profile-tab-strip"
        role="tablist"
        aria-label={label}
        onKeyDown={keys}
      >
        {items.map((item) => (
          <button
            key={item.id}
            id={`${id}-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={active === item.id}
            aria-controls={`${id}-panel-${item.id}`}
            tabIndex={active === item.id ? 0 : -1}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map(({ id: key, View }) => (
        <section
          key={key}
          id={`${id}-panel-${key}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${key}`}
          hidden={active !== key}
          tabIndex={0}
          className="profile-tab-content"
        >
          <View />
        </section>
      ))}
    </div>
  );
}
