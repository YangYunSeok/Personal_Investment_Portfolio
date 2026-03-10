/**
 * ──────────────────────────────────────────────
 * Screen ID : PIPDASHS01
 * Screen Name : Dashboard (대시보드)
 * Purpose : 대시보드 API 라우트 등록
 * API : GET /api/pip/dashboard
 * SSOT Docs : PIPDASHS01_API.md
 * Rules :
 *   - 조회 전용 (쓰기 API 제공 금지)
 *   - 계산 결과 저장 금지
 * ──────────────────────────────────────────────
 */

const registerPIPDASHS01Controller = (app, service) => {
    app.get("/api/pip/dashboard", async (req, res) => {
        try {
            const result = await service.getDashboard();
            res.json(result);
        } catch (err) {
            console.error("[PIPDASHS01Controller] GET /api/pip/dashboard error", err);
            res.status(500).json({ error: "Internal server error" });
        }
    });
};

module.exports = registerPIPDASHS01Controller;
