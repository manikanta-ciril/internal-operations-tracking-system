export const format = (value) =>
  new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export const fieldNames = [
  ["planned", "Tasks to be done"],
  ["completed", "Task Completed"],
  ["progress", "Tasks in Progress"],
  ["pending", "Tasks pending"],
  ["newTasks", "Any new tasks assigned or taken up during the day"],
  ["remarks", "Remarks"],
];
