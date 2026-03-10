const PIPPOSHLDS01Service = require("../Service/PIPPOSHLDS01Service");

const registerPIPPOSHLDS01Controller = (app, service) => {
    app.get("/api/pip/positions", async (req, res) => {
        try {
            const { asOf, accountId, exposure, assetType, q } = req.query;

            const filters = {
                asOf: asOf || new Date().toISOString().split('T')[0], // default to today if missing
                accountId,
                exposure,
                assetType,
                q
            };

            const rows = await service.getPositions(filters);

            res.json({
                asOf: filters.asOf,
                rows
            });
        } catch (err) {
            console.error("[PIPPOSHLDS01Controller] GET /api/pip/positions error", err);
            res.status(500).json({ error: "Internal server error" });
        }
    });
};

module.exports = registerPIPPOSHLDS01Controller;
