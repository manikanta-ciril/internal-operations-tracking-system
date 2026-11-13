import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "../../shared/work-ui/button";
import { Textarea } from "../../shared/work-ui/textarea";
import { format } from "./presentation";

export default function TaskRating({ task, onRate, busy }) {
  const [score, setScore] = useState(0),
    [note, setNote] = useState(""),
    [error, setError] = useState("");
  if (task.status !== "Completed") return null;
  const rating = task.rating;
  async function save(event) {
    event.preventDefault();
    setError("");
    if (score < 1) {
      setError("Choose a rating from one to five stars.");
      return;
    }
    if (!(await onRate({ score, note })))
      setError("Rating was not saved. Review the message above and retry.");
  }
  return (
    <section className="task-rating" aria-label="Completed work rating">
      <h3>
        {rating
          ? "Work rating"
          : onRate
            ? "Rate completed work"
            : "Work rating"}
      </h3>
      {rating ? (
        <>
          <div
            className="rating-stars"
            aria-label={`${rating.score} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                size={23}
                fill={value <= rating.score ? "currentColor" : "none"}
                aria-hidden="true"
              />
            ))}
            <strong>{rating.score}/5</strong>
          </div>
          <p className="rating-note">{rating.note}</p>
          <small>
            Rated by {rating.by} on {format(rating.at)}. Version{" "}
            {rating.version}.
          </small>
        </>
      ) : onRate ? (
        <form onSubmit={save}>
          <p>
            Rate the accepted result against the brief. Attendance is not part
            of this score.
          </p>
          <div className="rating-stars">
            <fieldset aria-label="Choose a work rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="rating-option">
                  <input
                    className="sr-only"
                    type="radio"
                    name={`rating-${task.id}`}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    value={value}
                    checked={score === value}
                    onChange={() => setScore(value)}
                    disabled={busy}
                  />
                  <Star
                    size={28}
                    fill={value <= score ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                </label>
              ))}
            </fieldset>
            <strong>{score ? `${score}/5` : "Choose 1–5"}</strong>
          </div>
          <label>
            Rating note
            <Textarea
              required
              maxLength={4000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={busy}
              placeholder="Explain the quality of the completed result."
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <Button type="submit" disabled={busy || !score}>
            {busy ? "Saving…" : "Save work rating"}
          </Button>
        </form>
      ) : (
        <p>The assigned reviewer has not rated this work yet.</p>
      )}
    </section>
  );
}
