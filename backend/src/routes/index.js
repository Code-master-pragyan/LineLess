const express = require("express");

const hospitalsRoutes = require("./hospitals");
const queuesRoutes = require("./queues");
const tokensRoutes = require("./tokens");
const adminRoutes = require("./admin");

const router = express.Router();

router.use(hospitalsRoutes);
router.use(queuesRoutes);
router.use(tokensRoutes);
router.use(adminRoutes);

module.exports = router;

