function parseIncludeDeleted(value) {
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

function firstErrorMessage(errors) {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : "validation failed";
}

function registerPIPASSETS01Controller(app, service) {
  app.get("/api/pip/assets", async (req, res) => {
    try {
      const query = {
        assetType: req.query.assetType,
        exposureRegion: req.query.exposureRegion,
        keyword: req.query.keyword,
        includeDeleted: parseIncludeDeleted(req.query.includeDeleted),
      };

      const items = await service.list(query);
      res.json({ items, total: items.length });
    } catch (e) {
      res.status(500).json({ message: "Server error", detail: e.message });
    }
  });

  app.get("/api/pip/assets/:assetId", async (req, res) => {
    try {
      const item = await service.getById(req.params.assetId);
      if (!item) {
        res.status(404).json({ message: "asset not found" });
        return;
      }
      res.json(item);
    } catch (e) {
      res.status(500).json({ message: "Server error", detail: e.message });
    }
  });

  app.post("/api/pip/assets", async (req, res) => {
    try {
      const result = await service.create(req.body ?? {});
      if (Object.keys(result.errors).length > 0) {
        res.status(400).json({
          message: firstErrorMessage(result.errors),
          errors: result.errors,
        });
        return;
      }

      res.status(201).json(result.item);
    } catch (e) {
      res.status(500).json({ message: "Server error", detail: e.message });
    }
  });

  app.put("/api/pip/assets/:assetId", async (req, res) => {
    try {
      const result = await service.update(req.params.assetId, req.body ?? {});

      if (result.notFound) {
        res.status(404).json({ message: "asset not found" });
        return;
      }

      if (Object.keys(result.errors).length > 0) {
        res.status(400).json({
          message: firstErrorMessage(result.errors),
          errors: result.errors,
        });
        return;
      }

      res.json(result.item);
    } catch (e) {
      res.status(500).json({ message: "Server error", detail: e.message });
    }
  });

  app.delete("/api/pip/assets/:assetId", async (req, res) => {
    try {
      const deleted = await service.softDelete(req.params.assetId);
      if (!deleted) {
        res.status(404).json({ message: "asset not found" });
        return;
      }

      res.json({
        assetId: deleted.assetId,
        deleted: true,
      });
    } catch (e) {
      res.status(500).json({ message: "Server error", detail: e.message });
    }
  });

  app.post("/api/pip/assets/:assetId/restore", async (req, res) => {
    try {
      const restored = await service.restore(req.params.assetId);
      if (!restored) {
        res.status(404).json({ message: "asset not found" });
        return;
      }
      res.json(restored);
    } catch (e) {
      res.status(500).json({ message: "Server error", detail: e.message });
    }
  });
}

module.exports = registerPIPASSETS01Controller;
