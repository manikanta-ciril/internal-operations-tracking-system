const { fetchCrm } = require("./client");

module.exports = function registerCrm(router, { pool }) {
  async function read(req, res) {
    res.set("Cache-Control", "no-store");
    const [roles] = await pool.execute(
      "SELECT role_code FROM employee_roles WHERE employee_id=?",
      [req.session.employee_id],
    );
    if (!roles.some(role => ["general-manager", "senior-manager", "chairman", "lead-manager"].includes(role.role_code))) {
      return res.status(403).json({ message: "Your role does not have CRM access." });
    }
    if (req.params.id && !/^\d+$/.test(req.params.id)) {
      return res.status(400).json({ message: "Choose a numeric CRM lead ID." });
    }
    try {
      const path = req.params.id ? "leads/" + req.params.id : "leads";
      res.json(await fetchCrm(path, req.query));
    } catch (error) {
      res.status(error.status || 502).json({ message: error.message });
    }
  }
  router.get("/api/auth/crm/leads", read);
  router.get("/api/auth/crm/leads/:id", read);
};
