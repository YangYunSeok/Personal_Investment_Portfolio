class PIPASSETS01Mapper {
  constructor() {
    this.assets = new Map();

    this.seed([
      {
        assetId: "AAPL",
        assetName: "Apple Inc.",
        assetType: "Stock",
        exposureRegion: "US",
        currency: "USD",
      },
      {
        assetId: "069500",
        assetName: "KODEX 200",
        assetType: "ETF",
        exposureRegion: "KR",
        currency: "KRW",
      },
    ]);
  }

  seed(list) {
    list.forEach((item) => {
      const now = new Date().toISOString();
      this.assets.set(item.assetId, {
        ...item,
        deleted: false,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  list({ assetType, exposureRegion, keyword, includeDeleted }) {
    const keywordLower = (keyword ?? "").toLowerCase();
    const rows = Array.from(this.assets.values()).filter((row) => {
      if (!includeDeleted && row.deleted) return false;
      if (assetType && row.assetType !== assetType) return false;
      if (exposureRegion && row.exposureRegion !== exposureRegion) return false;

      if (keywordLower) {
        const target = `${row.assetId} ${row.assetName}`.toLowerCase();
        if (!target.includes(keywordLower)) return false;
      }

      return true;
    });

    rows.sort((a, b) => a.assetId.localeCompare(b.assetId));
    return rows;
  }

  findById(assetId) {
    return this.assets.get(assetId) ?? null;
  }

  create(payload) {
    const now = new Date().toISOString();

    const row = {
      assetId: payload.assetId,
      assetName: payload.assetName,
      assetType: payload.assetType,
      exposureRegion: payload.exposureRegion,
      currency: payload.currency,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    };

    this.assets.set(row.assetId, row);
    return row;
  }

  update(assetId, payload) {
    const current = this.assets.get(assetId);
    if (!current) return null;

    const updated = {
      ...current,
      assetName: payload.assetName,
      assetType: payload.assetType,
      exposureRegion: payload.exposureRegion,
      currency: payload.currency,
      updatedAt: new Date().toISOString(),
    };

    this.assets.set(assetId, updated);
    return updated;
  }

  softDelete(assetId) {
    const current = this.assets.get(assetId);
    if (!current) return null;

    const deleted = {
      ...current,
      deleted: true,
      updatedAt: new Date().toISOString(),
    };

    this.assets.set(assetId, deleted);
    return deleted;
  }
}

module.exports = PIPASSETS01Mapper;
