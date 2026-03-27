const crypto = require("crypto");
const Razorpay = require("razorpay");
const queueService = require("../services/queueService");
const { emitQueueUpdate } = require("../socket/setupSocket");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── POST /create-order ───────────────────────────────────────────────────────
async function createOrder(req, res, next) {
  try {
    const { queueId } = req.body;
    if (!queueId) return res.status(400).json({ error: "queueId is required" });

    const liveState = await queueService.getQueueLiveState(queueId);
    if (!liveState) return res.status(404).json({ error: "Queue not found" });

    const order = await razorpay.orders.create({
      amount: process.env.TOKEN_PRICE_PAISE || 100,
      currency: "INR",
      receipt: `q_${queueId.slice(-8)}_${Date.now().toString().slice(-8)}`,
      notes: { queueId },
    });

    res.status(201).json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    next(err);
  }
}

// ─── POST /token/:queueId ─────────────────────────────────────────────────────
async function createToken(req, res, next) {
  try {
    const queueId = req.params.queueId;
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body || {};

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res.status(400).json({
        error: "Missing Razorpay payment fields (paymentId, orderId, signature)",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
    }

    const result = await queueService.generateToken(queueId, {
      razorpayPaymentId,
      razorpayOrderId,
    });

    const io = req.app.get("io");
    if (io) emitQueueUpdate(io, queueId);

    const { tokenNumber, liveState } = result;
    const peopleAhead = tokenNumber - (liveState.currentToken + 1);

    res.status(201).json({
      tokenNumber,
      queueId,
      currentToken: liveState.currentToken,
      waitingPeople: peopleAhead,
      estimatedWaitMinutes: liveState.avgTimePerUser * peopleAhead,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /queue-status/:queueId ───────────────────────────────────────────────
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

// ─── POST /next/:queueId ──────────────────────────────────────────────────────
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

// ─── POST /skip/:queueId ──────────────────────────────────────────────────────
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

module.exports = { createOrder, createToken, getQueueStatus, nextToken, skipToken };