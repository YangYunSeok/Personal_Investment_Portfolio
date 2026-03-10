const cors = require("cors");

const express = require("express");
const PIPASSETS01Mapper = require("./Mapper/PIPASSETS01Mapper");
const PIPASSETS01Service = require("./Service/PIPASSETS01Service");
const registerPIPASSETS01Controller = require("./Controller/PIPASSETS01Controller");

const PIPACCOUNTS01Service = require("./Service/PIPACCOUNTS01Service");
const registerPIPACCOUNTS01Controller = require("./Controller/PIPACCOUNTS01Controller");

const PIPACTLOGS01Service = require("./Service/PIPACTLOGS01Service");
const registerPIPACTLOGS01Controller = require("./Controller/PIPACTLOGS01Controller");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://158.179.163.106"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Assets
const assetMapper = new PIPASSETS01Mapper();
const assetService = new PIPASSETS01Service(assetMapper);
registerPIPASSETS01Controller(app, assetService);

// Accounts
const accountService = new PIPACCOUNTS01Service();
registerPIPACCOUNTS01Controller(app, accountService);

// Activity Logs (Transactions)
const activityLogService = new PIPACTLOGS01Service();
registerPIPACTLOGS01Controller(app, activityLogService);

// FX (Exchange)
const PIPFXS01Service = require("./Service/PIPFXS01Service");
const registerPIPFXS01Controller = require("./Controller/PIPFXS01Controller");
const fxService = new PIPFXS01Service();
registerPIPFXS01Controller(app, fxService);

// Positions (PIPPOSHLDS01)
const PIPPOSHLDS01Service = require("./Service/PIPPOSHLDS01Service");
const registerPIPPOSHLDS01Controller = require("./Controller/PIPPOSHLDS01Controller");
const positionService = new PIPPOSHLDS01Service();
registerPIPPOSHLDS01Controller(app, positionService);

// Dashboard (PIPDASHS01)
const PIPDASHS01Service = require("./Service/PIPDASHS01Service");
const registerPIPDASHS01Controller = require("./Controller/PIPDASHS01Controller");
const dashboardService = new PIPDASHS01Service();
registerPIPDASHS01Controller(app, dashboardService);

// Common Codes (PIP_CM_CD)
const PIPCMCD01Service = require("./Service/PIPCMCD01Service");
const registerPIPCMCD01Controller = require("./Controller/PIPCMCD01Controller");
const commonCodeService = new PIPCMCD01Service();
registerPIPCMCD01Controller(app, commonCodeService);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`PIP server listening on port ${port}`);
});
