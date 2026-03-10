/**
 * 공통코드 컨트롤러
 * Purpose: PIP_CM_CD 공통코드 조회/관리 API 제공
 * API:
 *  - GET /api/pip/common-code-groups
 *  - GET /api/pip/common-codes?grpId=ASSET_TYPE          (단일 그룹)
 *  - GET /api/pip/common-codes?grpId=ASSET_TYPE,TX_CCY_CD (다중 그룹, 쉼표 구분)
 *  - POST /api/pip/common-codes
 *  - PUT /api/pip/common-codes/:grpId/:cdId
 *  - PATCH /api/pip/common-codes/:grpId/:cdId/status
 */

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return ["true", "1", "y", "yes"].includes(value.trim().toLowerCase());
}

function normalizeIdentifier(value, fieldName) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) {
    throw new Error(`${fieldName} is required`);
  }
  if (!/^[A-Z0-9_]+$/.test(normalized)) {
    throw new Error(`${fieldName} must contain only A-Z, 0-9, _`);
  }
  return normalized;
}

function normalizeCodeName(value) {
  const codeName = String(value || "").trim();
  if (!codeName) {
    throw new Error("codeName is required");
  }
  return codeName;
}

function normalizeSortOrder(value) {
  const sortOrder = Number(value);
  if (!Number.isFinite(sortOrder)) {
    throw new Error("sortOrder must be a number");
  }
  return sortOrder;
}

function normalizeYn(value, fieldName, fallback = "Y") {
  const normalized = String(value == null ? fallback : value).trim().toUpperCase();
  if (!["Y", "N"].includes(normalized)) {
    throw new Error(`${fieldName} must be 'Y' or 'N'`);
  }
  return normalized;
}

function buildUpsertPayload(body) {
  return {
    codeGroupId: normalizeIdentifier(body.codeGroupId, "codeGroupId"),
    codeId: normalizeIdentifier(body.codeId, "codeId"),
    codeName: normalizeCodeName(body.codeName),
    codeDesc: String(body.codeDesc || "").trim() || null,
    sortOrder: normalizeSortOrder(body.sortOrder ?? 999),
    useYn: normalizeYn(body.useYn, "useYn", "Y"),
    delYn: normalizeYn(body.delYn, "delYn", "N"),
  };
}

function handleControllerError(res, err, context) {
  if (err && err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "이미 존재하는 공통코드입니다." });
  }

  if (err instanceof Error && /required|must contain only|must be a number|must be 'Y' or 'N'/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }

  console.error(context, err);
  return res.status(500).json({ error: "Internal Server Error" });
}

function registerPIPCMCD01Controller(app, service) {
  app.get("/api/pip/common-code-groups", async (req, res) => {
    try {
      const includeDeleted = toBoolean(req.query.includeDeleted);
      const groups = await service.getGroupSummaries({ includeDeleted });
      return res.json({ items: groups });
    } catch (err) {
      return handleControllerError(res, err, "[PIPCMCD01] GET /api/pip/common-code-groups error:");
    }
  });

  app.get("/api/pip/common-codes", async (req, res) => {
    try {
      const grpIdParam = (req.query.grpId || "").trim();
      const includeInactive = toBoolean(req.query.includeInactive);
      const includeDeleted = toBoolean(req.query.includeDeleted);

      if (!grpIdParam) {
        return res.status(400).json({ error: "grpId query parameter is required" });
      }

      const grpIds = grpIdParam
        .split(",")
        .map(s => normalizeIdentifier(s, "grpId"))
        .filter(Boolean);

      if (grpIds.length === 0) {
        return res.status(400).json({ error: "grpId query parameter is required" });
      }

      if (grpIds.length === 1) {
        const codes = await service.getCodesByGroup(grpIds[0], {
          activeOnly: !includeInactive,
          includeDeleted,
        });
        return res.json({ [grpIds[0]]: codes });
      }

      const result = await service.getCodesByGroups(grpIds, {
        activeOnly: !includeInactive,
        includeDeleted,
      });
      return res.json(result);
    } catch (err) {
      return handleControllerError(res, err, "[PIPCMCD01] GET /api/pip/common-codes error:");
    }
  });

  app.post("/api/pip/common-codes", async (req, res) => {
    try {
      const payload = buildUpsertPayload(req.body || {});
      const created = await service.createCode(payload);
      return res.status(201).json(created);
    } catch (err) {
      return handleControllerError(res, err, "[PIPCMCD01] POST /api/pip/common-codes error:");
    }
  });

  app.put("/api/pip/common-codes/:grpId/:cdId", async (req, res) => {
    try {
      const grpId = normalizeIdentifier(req.params.grpId, "grpId");
      const cdId = normalizeIdentifier(req.params.cdId, "cdId");
      const payload = buildUpsertPayload({
        ...req.body,
        codeGroupId: grpId,
        codeId: cdId,
      });

      const updated = await service.updateCode(grpId, cdId, payload);
      if (!updated) {
        return res.status(404).json({ error: "공통코드를 찾을 수 없습니다." });
      }
      return res.json(updated);
    } catch (err) {
      return handleControllerError(res, err, "[PIPCMCD01] PUT /api/pip/common-codes/:grpId/:cdId error:");
    }
  });

  app.patch("/api/pip/common-codes/:grpId/:cdId/status", async (req, res) => {
    try {
      const grpId = normalizeIdentifier(req.params.grpId, "grpId");
      const cdId = normalizeIdentifier(req.params.cdId, "cdId");
      const useYn = req.body && Object.prototype.hasOwnProperty.call(req.body, "useYn")
        ? normalizeYn(req.body.useYn, "useYn")
        : undefined;
      const delYn = req.body && Object.prototype.hasOwnProperty.call(req.body, "delYn")
        ? normalizeYn(req.body.delYn, "delYn")
        : undefined;

      const updated = await service.updateCodeStatus(grpId, cdId, {
        useYn: delYn === "Y" && !useYn ? "N" : useYn,
        delYn,
      });

      if (!updated) {
        return res.status(404).json({ error: "공통코드를 찾을 수 없습니다." });
      }

      return res.json(updated);
    } catch (err) {
      return handleControllerError(res, err, "[PIPCMCD01] PATCH /api/pip/common-codes/:grpId/:cdId/status error:");
    }
  });
}

module.exports = registerPIPCMCD01Controller;
