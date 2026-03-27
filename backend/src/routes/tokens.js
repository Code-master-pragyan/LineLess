const express = require("express");
const { adminAuth } = require("../middleware/adminAuth");
const { createToken, getQueueStatus, nextToken, skipToken } = require("../controllers/tokensController");

const router = express.Router();

router.post("/token/:queueId", createToken);
router.get("/queue-status/:queueId", getQueueStatus);

router.post("/next/:queueId", adminAuth, nextToken);
router.post("/skip/:queueId", adminAuth, skipToken);

module.exports = router;

