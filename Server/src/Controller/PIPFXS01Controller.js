/**
 * Screen ID: PIPFXS01
 * Screen Name: 환전 (Exchange)
 * Purpose: 환전 화면 Controller
 * Related SSOT:
 *  - docs/design/api/PIPFXS01_API.md
 * Rules:
 *  - 모델 Validation 수행 (fromCurrency != toCurrency 등)
 */

function registerPIPFXS01Controller(app, service) {
    app.get("/api/pip/fx-activities", async (req, res) => {
        try {
            const filters = {
                fromDate: req.query.fromDate,
                toDate: req.query.toDate,
                accountId: req.query.accountId,
                fromCurrency: req.query.fromCurrency,
                toCurrency: req.query.toCurrency,
            };

            const items = await service.list(filters);
            res.json({
                items,
                total: items.length
            });
        } catch (err) {
            console.error("[PIPFXS01] GET /api/pip/fx-activities error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.post("/api/pip/fx-activities", async (req, res) => {
        try {
            const data = req.body;

            // 1. 필수값 체크
            const requiredFields = ["tradeDate", "accountId", "fromCurrency", "toCurrency", "tradeAmount", "tradeCurrency", "fxRate"];
            for (const field of requiredFields) {
                if (data[field] === undefined || data[field] === null || data[field] === "") {
                    return res.status(400).json({ error: `Missing required field: ${field}` });
                }
            }

            // 2. SSOT 모델 도메인 규칙 체크
            if (data.fromCurrency === data.toCurrency) {
                return res.status(400).json({ error: "출금 통화와 입금 통화는 달라야 합니다." });
            }
            if (data.tradeAmount <= 0) {
                return res.status(400).json({ error: "0보다 큰 값을 입력하세요." });
            }
            if (data.fxRate <= 0) {
                return res.status(400).json({ error: "0보다 큰 값을 입력하세요." });
            }
            if (data.tradeCurrency !== data.fromCurrency) {
                return res.status(400).json({ error: "거래통화는 출금통화와 동일해야 합니다." });
            }

            const item = await service.create(data);
            res.status(201).json({
                transactionId: item.transactionId,
                transactionType: "FX"
            });
        } catch (err) {
            console.error("[PIPFXS01] POST /api/pip/fx-activities error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get("/api/pip/fx/meta", async (req, res) => {
        try {
            const meta = await service.getMetadata();
            res.json(meta);
        } catch (err) {
            console.error("[PIPFXS01] GET /api/pip/fx/meta error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}

module.exports = registerPIPFXS01Controller;
