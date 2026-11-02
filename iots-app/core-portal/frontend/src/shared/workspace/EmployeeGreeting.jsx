import { useEffect, useState } from "react";
import wavingHand from "../../features/creative-associate/workspace/assets/waving-hand.webp";
import {
  employeeGreetings,
  employeeGreeting,
  getInitialMessage,
} from "./employee-greeting-model.js";
export default function EmployeeGreeting({ employee, now }) {
  const { title } = employeeGreeting(employee, now);
  const [currentMessage, setCurrentMessage] = useState(() =>
    getInitialMessage(employee?.id),
  );
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [cursorStage, setCursorStage] = useState("line1");

  // Rotate random greeting every 5 minutes (300,000 ms) with a distinct message
  useEffect(() => {
    const timer = setInterval(
      () => {
        setCurrentMessage((prev) => {
          const pool = employeeGreetings.filter((item) => item !== prev);
          const next = pool[Math.floor(Math.random() * pool.length)];
          try {
            if (typeof sessionStorage !== "undefined") {
              sessionStorage.setItem(
                `ciril_greeting_msg_${employee?.id || "emp"}`,
                next,
              );
            }
          } catch {}
          return next;
        });
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(timer);
  }, [employee?.id]);

  // Smooth two-phase typing effect inspired by core-portal/frontend MinimalTypingTitle
  useEffect(() => {
    const media =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : { matches: false };

    if (media.matches) {
      // Synchronise the animated text with the external reduced-motion preference.
      // eslint-disable-next-line react/set-state-in-effect
      setText1(title);
      setText2(currentMessage);
      setCursorStage("done");
      return;
    }

    let index1 = 0;
    let index2 = 0;
    let timer1;
    let timer2;
    let doneTimer;
    let startTimer;

    {
      setText1("");
      setText2("");
      setCursorStage("line1");

      const typeLine1 = () => {
        if (index1 < title.length) {
          setText1(title.slice(0, index1 + 1));
          index1++;
          timer1 = setTimeout(typeLine1, 45);
        } else {
          setCursorStage("line2");
          timer2 = setTimeout(typeLine2, 120);
        }
      };

      const typeLine2 = () => {
        if (index2 < currentMessage.length) {
          setText2(currentMessage.slice(0, index2 + 1));
          index2++;
          timer2 = setTimeout(typeLine2, 35);
        } else {
          doneTimer = setTimeout(() => {
            setCursorStage("done");
          }, 500);
        }
      };

      startTimer = setTimeout(typeLine1, 200);
    }

    const onMotionChange = () => {
      if (media.matches) {
        clearTimeout(startTimer);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(doneTimer);
        setText1(title);
        setText2(currentMessage);
        setCursorStage("done");
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", onMotionChange);
    }

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(doneTimer);
      if (media.removeEventListener) {
        media.removeEventListener("change", onMotionChange);
      }
    };
  }, [title, currentMessage]);

  return (
    <>
      <h1 className="employee-greeting">
        <span className="sr-only">{title}</span>
        <span aria-hidden="true">
          {text1}
          {cursorStage === "line1" && (
            <span className="typing-caret" aria-hidden="true" />
          )}
        </span>
        <img
          className="greeting-hand"
          data-ready={cursorStage === "done"}
          src={wavingHand}
          width="38"
          height="38"
          alt=""
        />
      </h1>
      <p className="employee-greeting-message" aria-live="off">
        <span>{text2}</span>
        {cursorStage === "line2" && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </p>
    </>
  );
}
