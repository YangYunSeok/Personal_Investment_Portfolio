function parseIncludeDeleted(value) {
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

function firstErrorMessage(errors) {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : "validation failed";
}

function registerPIPASSETS01Controller(app, service) {
  app.get("/api/pip/assets", (req, res) => {
    const query = {
      assetType: req.query.assetType,
      exposureRegion: req.query.exposureRegion,
      keyword: req.query.keyword,
      includeDeleted: parseIncludeDeleted(req.query.includeDeleted),
    };

    const items = service.list(query);
    res.json({ items, total: items.length });
  });

  app.get("/api/pip/assets/:assetId", (req, res) => {
    const item = service.getById(req.params.assetId);
    if (!item) {
      res.status(404).json({ message: "asset not found" });
      return;
    }

    res.json(item);
  });

  app.post("/api/pip/assets", (req, res) => {
    const result = service.create(req.body ?? {});
    if (Object.keys(result.errors).length > 0) {
      res.status(400).json({
        message: firstErrorMessage(result.errors),
        errors: result.errors,
      });
      return;
    }

    res.status(201).json(result.item);
  });

  app.put("/api/pip/assets/:assetId", (req, res) => {
    const result = service.update(req.params.assetId, req.body ?? {});

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
  });

  app.delete("/api/pip/assets/:assetId", (req, res) => {
    const deleted = service.softDelete(req.params.assetId);
    if (!deleted) {
      res.status(404).json({ message: "asset not found" });
      return;
    }

    res.json({
      assetId: deleted.assetId,
      deleted: true,
    });
  });
}

module.exports = registerPIPASSETS01Controller;
