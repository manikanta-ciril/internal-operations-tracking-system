import { useState } from "react";
import { ListChecks, ChartNoAxesColumnIncreasing, Check } from "lucide-react";
function Poll({ message, act, busy }) {
  const content = message.content;
  const selected = content.results.flatMap((option, index) =>
    option.mine ? [index] : [],
  );
  return (
    <section className="messaging-poll" aria-label={content.question}>
      <h3>
        <ChartNoAxesColumnIncreasing size={17} />
        {content.question}
      </h3>
      <p>{content.multiple ? "Choose one or more" : "Choose one answer"}</p>
      {content.options.map((label, index) => (
        <button
          key={index}
          disabled={busy}
          aria-pressed={content.results[index].mine}
          onClick={() =>
            act("vote", {
              options: content.multiple
                ? selected.includes(index)
                  ? selected.filter((option) => option !== index)
                  : [...selected, index]
                : content.results[index].mine
                  ? []
                  : [index],
            })
          }
        >
          <span
            className="messaging-poll-bar"
            style={{
              width: `${content.totalVoters ? (content.results[index].count / content.totalVoters) * 100 : 0}%`,
            }}
          />
          <span>
            {content.results[index].mine && <Check size={12} />}
            {label}
          </span>
          <b>{content.results[index].count}</b>
        </button>
      ))}
      <small>
        {content.totalVoters}{" "}
        {content.totalVoters === 1 ? "person voted" : "people voted"}
      </small>
    </section>
  );
}
function Checklist({ message, act, busy, pending }) {
  const content = message.content;
  const complete = content.checks.filter((entry) => entry.checked).length;
  return (
    <section className="messaging-checklist" aria-label={content.title}>
      <h3>
        <ListChecks size={17} />
        {content.title}
      </h3>
      <p>
        {complete} of {content.items.length} complete
      </p>
      <div className="messaging-check-progress">
        <span
          style={{ width: `${(complete / content.items.length) * 100}%` }}
        />
      </div>
      {content.items.map((label, index) => (
        <label
          key={index}
          data-checked={Boolean(content.checks[index].checked)}
        >
          <input
            type="checkbox"
            disabled={busy}
            checked={
              pending?.index === index
                ? pending.checked
                : Boolean(content.checks[index].checked)
            }
            onChange={(event) =>
              act("checkItem", { index, checked: event.target.checked })
            }
          />
          <span>
            <strong className="messaging-check-label">{label}</strong>
            {content.checks[index].updatedBy && (
              <small>Updated by {content.checks[index].updatedBy}</small>
            )}
          </span>
        </label>
      ))}
    </section>
  );
}
const cards = { poll: Poll, checklist: Checklist };
export default function MessageContent({ message, onInteract, onError }) {
  const [pending, setPending] = useState(null);
  const Card = cards[message.content.type];
  async function act(action, selection) {
    setPending({ action, ...selection });
    try {
      await onInteract(message.id, action, selection);
    } catch (failure) {
      onError(failure.message);
    } finally {
      setPending(null);
    }
  }
  return (
    <Card
      message={message}
      act={act}
      busy={Boolean(pending)}
      pending={pending}
    />
  );
}
