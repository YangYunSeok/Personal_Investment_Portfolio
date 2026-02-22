function registerPIPACCOUNTS01Controller(app, service) {
  app.get("/api/pip/accounts", async (req, res) => {
    try {
      const filters = {
        keyword: req.query.keyword,
        includeDeleted: req.query.includeDeleted === "true",
      };
      const items = await service.list(filters);
      res.json({ items });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/pip/accounts", async (req, res) => {
    try {
      if (!req.body.id || !req.body.name) {
        return res.status(400).json({ message: "ID와 명칭은 필수입니다." });
      }
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/pip/accounts/:id", async (req, res) => {
    try {
      const item = await service.update(req.params.id, req.body);
      if (!item) return res.status(404).json({ message: "계좌를 찾을 수 없습니다." });
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/pip/accounts/:id", async (req, res) => {
    try {
      const success = await service.softDelete(req.params.id);
      if (!success) return res.status(404).json({ message: "계좌를 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/pip/accounts/:id/restore", async (req, res) => {
    try {
      const success = await service.restore(req.params.id);
      if (!success) return res.status(404).json({ message: "계좌를 찾을 수 없습니다." });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

module.exports = registerPIPACCOUNTS01Controller;
