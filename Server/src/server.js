const express = require("express");
const PIPASSETS01Mapper = require("./PIPASSETS01Mapper");
const PIPASSETS01Service = require("./PIPASSETS01Service");
const registerPIPASSETS01Controller = require("./PIPASSETS01Controller");

const app = express();
app.use(express.json());

const mapper = new PIPASSETS01Mapper();
const service = new PIPASSETS01Service(mapper);
registerPIPASSETS01Controller(app, service);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`PIP server listening on http://localhost:${port}`);
});
