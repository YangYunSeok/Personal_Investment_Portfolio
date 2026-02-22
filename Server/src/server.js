const express = require("express");
const PIPASSETS01Mapper = require("./Mapper/PIPASSETS01Mapper");
const PIPASSETS01Service = require("./Service/PIPASSETS01Service");
const registerPIPASSETS01Controller = require("./Controller/PIPASSETS01Controller");

const PIPACCOUNTS01Service = require("./Service/PIPACCOUNTS01Service");
const registerPIPACCOUNTS01Controller = require("./Controller/PIPACCOUNTS01Controller");

const PIPACTLOGS01Service = require("./Service/PIPACTLOGS01Service");
const registerPIPACTLOGS01Controller = require("./Controller/PIPACTLOGS01Controller");

const app = express();
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

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`PIP server listening on http://localhost:${port}`);
});
