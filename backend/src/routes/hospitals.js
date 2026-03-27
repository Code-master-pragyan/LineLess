const express = require("express");
const { createHospital, listHospitals } = require("../controllers/hospitalsController");
const { adminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// Admin: create hospital
router.post("/hospitals", adminAuth, createHospital);

// Public: list/search hospitals
router.get("/hospitals", listHospitals);

module.exports = router;

