const Hospital = require("../models/Hospital");
const Queue = require("../models/Queue");
const Token = require("../models/Token");
const { estimateWaitMinutes } = require("../utils/queueMath");

async function getQueueLiveState(queueId) {
  const queue = await Queue.findById(queueId).lean();
  if (!queue) return null;

  const waitingTokens = await Token.find({ queueId, status: "waiting" })
    .sort({ tokenNumber: 1 })
    .select({ tokenNumber: 1, _id: 0 })
    .lean();

  const waitingTokenNumbers = waitingTokens.map((t) => t.tokenNumber);
  const waitingCount = waitingTokenNumbers.length;

  return {
    queueId: queue._id.toString(),
    hospitalId: queue.hospitalId.toString(),
    queueName: queue.name,
    currentToken: queue.currentToken,
    avgTimePerUser: queue.avgTimePerUser,
    waitingTokens: waitingTokenNumbers,
    waitingCount,
    nextTokenNumber: queue.currentToken + waitingCount + 1,
  };
}

async function getUserTokenStatus(queueId, tokenNumber) {
  const queue = await Queue.findById(queueId).lean();
  if (!queue) return null;

  const token = await Token.findOne({ queueId, tokenNumber }).lean();
  const waitingPeople = await Token.countDocuments({
    queueId,
    status: "waiting",
    tokenNumber: { $lt: tokenNumber },
  });

  return {
    queueId: queueId.toString(),
    tokenNumber,
    status: token ? token.status : "unknown",
    peopleAhead: waitingPeople,
    estimatedWaitMinutes: estimateWaitMinutes(waitingPeople, queue.avgTimePerUser),
  };
}

async function createHospital({ name, location }) {
  const hospital = await Hospital.create({ name, location });
  return hospital;
}

async function listHospitals({ query } = {}) {
  if (!query) return Hospital.find({}).sort({ createdAt: -1 }).lean();
  const q = String(query).trim();
  return Hospital.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();
}

async function createQueue({ hospitalId, name, avgTimePerUser }) {
  const queue = await Queue.create({
    hospitalId,
    name,
    avgTimePerUser: avgTimePerUser ?? 5,
  });
  return queue;
}

async function listQueuesByHospital(hospitalId) {
  return Queue.find({ hospitalId }).sort({ createdAt: -1 }).lean();
}

async function generateToken(queueId, { mockPayment }) {
  if (!mockPayment) {
    const err = new Error("Payment required (mockPayment missing)");
    err.statusCode = 400;
    throw err;
  }

  const queue = await Queue.findById(queueId);
  if (!queue) {
    const err = new Error("Queue not found");
    err.statusCode = 404;
    throw err;
  }

  const waitingCount = await Token.countDocuments({ queueId, status: "waiting" });
  const tokenNumber = queue.currentToken + waitingCount + 1;

  const token = await Token.create({
    queueId,
    tokenNumber,
    status: "waiting",
  });

  const liveState = await getQueueLiveState(queueId);
  return { token, tokenNumber, liveState };
}

async function advanceToken(queueId, action /* 'next' | 'skip' */) {
  const queue = await Queue.findById(queueId);
  if (!queue) {
    const err = new Error("Queue not found");
    err.statusCode = 404;
    throw err;
  }

  const nextToken = await Token.findOne({
    queueId,
    status: "waiting",
    tokenNumber: { $gt: queue.currentToken },
  }).sort({ tokenNumber: 1 });

  if (!nextToken) return { moved: false, liveState: await getQueueLiveState(queueId) };

  nextToken.status = action === "skip" ? "skipped" : "completed";
  await nextToken.save();

  queue.currentToken = nextToken.tokenNumber;
  await queue.save();

  const liveState = await getQueueLiveState(queueId);
  return { moved: true, liveState };
}

module.exports = {
  getQueueLiveState,
  getUserTokenStatus,
  createHospital,
  listHospitals,
  createQueue,
  listQueuesByHospital,
  generateToken,
  advanceToken,
};

