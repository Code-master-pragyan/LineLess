const queueService = require("../services/queueService");

function getQueueRoom(queueId) {
  return `queue:${queueId}`;
}

async function emitQueueUpdate(io, queueId) {
  const liveState = await queueService.getQueueLiveState(queueId);
  if (!liveState) return;

  io.to(getQueueRoom(queueId)).emit("queue:update", liveState);
}

function setupSocket(io) {
  io.on("connection", (socket) => {
    socket.on("joinQueue", async ({ queueId }) => {
      if (!queueId) return;

      const room = getQueueRoom(queueId);
      socket.join(room);

      const liveState = await queueService.getQueueLiveState(queueId);
      if (liveState) {
        socket.emit("queue:update", liveState);
      }
    });
  });
}

module.exports = { setupSocket, emitQueueUpdate, getQueueRoom };

