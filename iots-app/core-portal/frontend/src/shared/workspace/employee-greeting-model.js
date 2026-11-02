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
export function getInitialMessage(employeeId) {
  try {
    const key = `ciril_greeting_msg_${employeeId || "emp"}`;
    const saved =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem(key)
        : null;
    if (saved && employeeGreetings.includes(saved)) {
      return saved;
    }
  } catch {}
  const randomMsg =
    employeeGreetings[Math.floor(Math.random() * employeeGreetings.length)];
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(
        `ciril_greeting_msg_${employeeId || "emp"}`,
        randomMsg,
      );
    }
  } catch {}
  return randomMsg;
}
