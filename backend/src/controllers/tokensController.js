const queueService = require("../services/queueService");
const { emitQueueUpdate } = require("../socket/setupSocket");

async function createToken(req, res, next) {
  try {
    const queueId = req.params.queueId;
    const { mockPayment } = req.body || {};
    const result = await queueService.generateToken(queueId, { mockPayment });

    // Emit to socket room for live UI
    const io = req.app.get("io");
    if (io) emitQueueUpdate(io, queueId);

    const { tokenNumber, liveState } = result;
    res.status(201).json({
      tokenNumber,
      queueId,
      currentToken: liveState.currentToken,
      waitingPeople: tokenNumber - (liveState.currentToken + 1), // derived, matches peopleAhead
      estimatedWaitMinutes: liveState.avgTimePerUser * (tokenNumber - (liveState.currentToken + 1)),
    });
  } catch (err) {
    next(err);
  }
}

async function getQueueStatus(req, res, next) {
  try {
    const queueId = req.params.queueId;
    const liveState = await queueService.getQueueLiveState(queueId);
    if (!liveState) return res.status(404).json({ error: "Queue not found" });

    const tokenNumberRaw = req.query.tokenNumber;
    const tokenNumber = tokenNumberRaw ? Number(tokenNumberRaw) : null;

    if (!tokenNumber || Number.isNaN(tokenNumber)) {
      return res.json(liveState);
    }

    const userStatus = await queueService.getUserTokenStatus(queueId, tokenNumber);
    res.json({ ...liveState, userStatus });
  } catch (err) {
    next(err);
  }
}

async function nextToken(req, res, next) {
  try {
    const queueId = req.params.queueId;
    const { moved, liveState } = await queueService.advanceToken(queueId, "next");

    const io = req.app.get("io");
    if (io) await emitQueueUpdate(io, queueId);

    res.json({ moved, liveState });
  } catch (err) {
    next(err);
  }
}

async function skipToken(req, res, next) {
  try {
    const queueId = req.params.queueId;
    const { moved, liveState } = await queueService.advanceToken(queueId, "skip");

    const io = req.app.get("io");
    if (io) await emitQueueUpdate(io, queueId);

    res.json({ moved, liveState });
  } catch (err) {
    next(err);
  }
}

module.exports = { createToken, getQueueStatus, nextToken, skipToken };

