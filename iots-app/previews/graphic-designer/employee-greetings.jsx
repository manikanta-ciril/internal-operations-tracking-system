import { useEffect, useState, useRef } from "react";
import wavingHand from "./assets/waving-hand.webp";
export const employeeGreetings = [
  "A fresh start for your best work.",
  "One thoughtful step can move good work forward.",
  "Your ideas have a place here.",
  "Make room for something worth creating today.",
  "Start with one clear priority.",
  "Bring your focus. We will keep the details together.",
  "Small steps make meaningful progress.",
  "Good work begins with a clear next step.",
  "Take a breath and find your rhythm.",
  "Your next idea could make the difference.",
  "A little clarity goes a long way.",
  "Build on the work you are proud of.",
  "Today is another chance to make things better.",
  "Keep your pace steady and your work thoughtful.",
  "Choose one task and give it your attention.",
  "Your care shows in the details.",
  "Make progress at a pace you can sustain.",
  "Bring a fresh perspective to the work ahead.",
  "A clear plan makes space for good ideas.",
  "Your effort moves the team forward.",
  "Turn the next brief into something useful.",
  "Let your next step be a confident one.",
  "You do not need to finish everything at once.",
  "Focus on what matters most today.",
  "There is room to learn as you go.",
  "Good questions make better work.",
  "Keep the purpose clear and the next step simple.",
  "Your contribution is part of something shared.",
  "Start small. Keep the quality high.",
  "Give your ideas the attention they deserve.",
  "Make today a little more organised.",
  "Pick up where your best thinking left off.",
  "Thoughtful work is worth taking time for.",
  "Bring curiosity to your next challenge.",
  "A useful update can unlock the next step.",
  "Keep making the work a little better.",
  "Your next small improvement counts.",
  "Let a clear brief guide a creative day.",
  "Find your focus and make it count.",
  "There is good work ahead, one step at a time.",
  "Today is a good day to try a fresh approach.",
  "Make space for careful work and clear communication.",
  "Your ideas can help someone move forward.",
  "Progress begins with showing up for the next step.",
  "Bring your strengths to the work in front of you.",
  "Keep learning. Keep refining. Keep moving.",
  "A steady start can shape a productive day.",
  "Make something clear, useful and considered.",
  "Give the next task a little of your best thinking.",
  "Welcome to another day of work with purpose.",
];
export function employeeGreeting(employee, now) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (name) => parts.find((p) => p.type === name).value;
  const hour = Number(part("hour"));
  const seed = [
    employee?.id || "employee",
    part("year"),
    part("month"),
    part("day"),
  ].join("-");
  const index =
    Array.from(seed).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 0) %
    employeeGreetings.length;
  return {
    title: `${hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"}, ${employee?.name || "there"}`,
    message: employeeGreetings[index],
  };
}
export function isOperationalEmployeeRole(employee) {
  const role =
    typeof employee === "string"
      ? employee
      : employee?.role || employee?.id || employee?.label || "";
  const normalized = role.toLowerCase().replace(/[-_]/g, " ");

  const isMatch =
    normalized.includes("creative communication") ||
    normalized.includes("creative associate") ||
    normalized.includes("graphic designer") ||
    normalized.includes("designer") ||
    normalized.includes("business development") ||
    normalized.includes("bde") ||
    normalized.includes("executive");

  const isExcluded =
    normalized.includes("senior executive") ||
    normalized.includes("general manager") ||
    normalized.includes("senior manager") ||
    normalized.includes("reporting manager") ||
    normalized.includes("reviewer") ||
    normalized.includes("admin") ||
    normalized.includes("chairman") ||
    normalized.includes("director");

  return isMatch && !isExcluded;
}

function getInitialMessage(employeeId) {
  try {
    const key = `ciril_greeting_msg_${employeeId || "emp"}`;
    const saved =
      typeof sessionStorage !== "undefined" ? sessionStorage.getItem(key) : null;
    if (saved && employeeGreetings.includes(saved)) {
      return saved;
    }
  } catch {}
  const randomMsg =
    employeeGreetings[Math.floor(Math.random() * employeeGreetings.length)];
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(`ciril_greeting_msg_${employeeId || "emp"}`, randomMsg);
    }
  } catch {}
  return randomMsg;
}

export default function EmployeeGreeting({ employee, now }) {
  const { title } = employeeGreeting(employee, now);
  const [currentMessage, setCurrentMessage] = useState(() =>
    getInitialMessage(employee?.id),
  );
  const [text1, setText1] = useState(title);
  const [text2, setText2] = useState(currentMessage);
  const [cursorStage, setCursorStage] = useState("done");
  const isInitialMount = useRef(true);

  // Rotate random greeting every 5 minutes (300,000 ms) with a distinct message
  useEffect(() => {
    const timer = setInterval(
      () => {
        setCurrentMessage((prev) => {
          const pool = employeeGreetings.filter((item) => item !== prev);
          const next = pool[Math.floor(Math.random() * pool.length)];
          try {
            if (typeof sessionStorage !== "undefined") {
              sessionStorage.setItem(`ciril_greeting_msg_${employee?.id || "emp"}`, next);
            }
          } catch {}
          return next;
        });
      },
      5 * 60 * 1000,
    );
    return () => clearInterval(timer);
  }, [employee?.id]);

  // Smooth two-phase typing effect inspired by authentication-system/frontend MinimalTypingTitle
  useEffect(() => {
    const media =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : { matches: false };

    if (media.matches) {
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

    if (isInitialMount.current) {
      isInitialMount.current = false;
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
    } else {
      // Retype line 2 smoothly on 5-minute rotation
      setText2("");
      setCursorStage("line2");

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

      startTimer = setTimeout(typeLine2, 100);
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
        <img className="greeting-hand" src={wavingHand} width="38" height="38" alt="" />
      </h1>
      <p className="employee-greeting-message" aria-live="off">
        <span>{text2}</span>
        {cursorStage === "line2" && <span className="typing-caret" aria-hidden="true" />}
      </p>
    </>
  );
}
