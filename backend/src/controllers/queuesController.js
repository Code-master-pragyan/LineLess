const queueService = require("../services/queueService");
const { getQueueLiveState } = queueService;

async function createQueue(req, res, next) {
  try {
    // Extracted the new startTime and endTime parameters
    const { hospitalId, name, avgTimePerUser, startTime, endTime } = req.body || {};
    if (!hospitalId || !name) {
      return res.status(400).json({ error: "hospitalId and name are required" });
    }

    const queue = await queueService.createQueue({ 
      hospitalId, 
      name, 
      avgTimePerUser,
      startTime, 
      endTime 
    });
    
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

// NEW: Function to handle the cancellation/deletion of a queue
async function cancelQueue(req, res, next) {
  try {
    const queueId = req.params.queueId;
    
    // Assumes your queueService has a method to delete the queue.
    // Ensure you create `deleteQueue` in `queueService.js` handling DB removal.
    await queueService.deleteQueue(queueId);
    
    res.status(200).json({ message: "Queue cancelled successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = { createQueue, listQueues, cancelQueue };