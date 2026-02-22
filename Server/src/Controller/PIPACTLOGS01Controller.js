function validateTransaction(data) {
  const errors = {};
  const { transactionType, tradeCurrency, fxRate, quantity, unitPrice, tradeAmount, fromCurrency, toCurrency } = data;

  if (!data.tradeDate) errors.tradeDate = "Trade date is required";
  if (!data.accountId) errors.accountId = "Account ID is required";
  if (!transactionType) errors.transactionType = "Transaction type is required";

  // BUY / SELL
  if (["BUY", "SELL"].includes(transactionType)) {
    if (!quantity) errors.quantity = "Quantity is required for BUY/SELL";
    if (!unitPrice) errors.unitPrice = "Unit price is required for BUY/SELL";
    if (tradeCurrency !== "KRW" && !fxRate) {
      errors.fxRate = "FX Rate is required for foreign currency transactions";
    }
  }

  // DIVIDEND / INTEREST
  if (["DIVIDEND", "INTEREST"].includes(transactionType)) {
    if (!tradeAmount && !data.amount) errors.tradeAmount = "Trade amount is required";
    if (quantity || unitPrice) {
      errors.general = "Quantity and Unit Price should be empty for DIVIDEND/INTEREST";
    }
    if (tradeCurrency !== "KRW" && !fxRate) {
      errors.fxRate = "FX Rate is required for foreign currency transactions";
    }
  }

  // DEPOSIT / WITHDRAW / FEE / TAX
  if (["DEPOSIT", "WITHDRAW", "FEE", "TAX"].includes(transactionType)) {
    if (!tradeAmount && !data.amount) errors.tradeAmount = "Trade amount is required";
    if (tradeCurrency !== "KRW" && !fxRate) {
      errors.fxRate = "FX Rate is required for foreign currency transactions";
    }
  }

  // FX
  if (transactionType === "FX") {
    if (!fromCurrency) errors.fromCurrency = "From currency is required";
    if (!toCurrency) errors.toCurrency = "To currency is required";
    if (!fxRate) errors.fxRate = "FX Rate is required";
    if (fromCurrency === toCurrency) {
      errors.toCurrency = "From and To currency must be different";
    }
    if (!tradeAmount && !data.amount) errors.tradeAmount = "Trade amount is required";
  }

  return errors;
}

function registerPIPACTLOGS01Controller(app, service) {
  app.get("/api/pip/transactions", async (req, res) => {
    try {
      const filters = {
        from: req.query.from,
        to: req.query.to,
        accountId: req.query.accountId,
        assetType: req.query.assetType,
        exposureRegion: req.query.exposureRegion,
        transactionType: req.query.transactionType,
        tradeCurrency: req.query.tradeCurrency,
        keyword: req.query.keyword,
        includeDeleted: req.query.includeDeleted === "true",
      };
      const items = await service.list(filters);
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/pip/transactions/metadata", async (req, res) => {
    try {
      const metadata = await service.getMetadata();
      res.json(metadata);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/pip/transactions/:id", async (req, res) => {
    try {
      const item = await service.getById(req.params.id);
      if (!item) return res.status(404).json({ error: "Transaction not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/pip/transactions", async (req, res) => {
    try {
      const errors = validateTransaction(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/pip/transactions/:id", async (req, res) => {
    try {
      const errors = validateTransaction(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }
      const item = await service.update(req.params.id, req.body);
      if (!item) return res.status(404).json({ error: "Transaction not found" });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/pip/transactions/:id", async (req, res) => {
    try {
      const success = await service.softDelete(req.params.id);
      if (!success) return res.status(404).json({ error: "Transaction not found" });
      res.json({ success: true, message: "Transaction deleted (soft delete)" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

module.exports = registerPIPACTLOGS01Controller;
