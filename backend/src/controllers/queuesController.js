const queueService = require("../services/queueService");
const { getQueueLiveState } = queueService;

async function createQueue(req, res, next) {
  try {
    const { hospitalId, name, avgTimePerUser } = req.body || {};
    if (!hospitalId || !name) {
      return res.status(400).json({ error: "hospitalId and name are required" });
    }

    const queue = await queueService.createQueue({ hospitalId, name, avgTimePerUser });
    const liveState = await getQueueLiveState(queue._id);
    res.status(201).json({ queue, liveState });
  } catch (err) {
    next(err);
  }
}

async function listQueues(req, res, next) {
  try {
    const hospitalId = req.params.hospitalId;
    const queues = await queueService.listQueuesByHospital(hospitalId);

    // Add quick live info without hitting socket for each.
    const liveStates = await Promise.all(
      queues.map((q) => getQueueLiveState(q._id).catch(() => null))
    );

    res.json(
      queues.map((q, idx) => ({
        ...q,
        liveState: liveStates[idx],
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { createQueue, listQueues };

