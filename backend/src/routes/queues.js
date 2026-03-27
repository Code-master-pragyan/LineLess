const express = require("express");
const { adminAuth } = require("../middleware/adminAuth");
const { createQueue, listQueues, cancelQueue } = require("../controllers/queuesController");

const router = express.Router();

router.post("/queues", adminAuth, createQueue);
router.get("/queues/:hospitalId", listQueues);
router.delete("/queues/:queueId", cancelQueue);

module.exports = router;

