const { createHolidayService } = require("./holidays");

// Registered behind the same active-session guards as the employee workspace.
module.exports = (router, { pool }) => {
  const calendar = createHolidayService({ pool });
  router.get("/api/auth/workspace/calendar/holidays", async (req, res) => {
    const result = await calendar.get(req.query.year);
    res.set("Cache-Control", "private, max-age=300").json(result);
  });
};
