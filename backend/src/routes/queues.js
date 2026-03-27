const express = require("express");
const { adminAuth } = require("../middleware/adminAuth");
const { createQueue, listQueues } = require("../controllers/queuesController");

const router = express.Router();

router.post("/queues", adminAuth, createQueue);
router.get("/queues/:hospitalId", listQueues);

module.exports = router;

