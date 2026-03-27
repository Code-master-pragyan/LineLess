const queueService = require("../services/queueService");

async function createHospital(req, res, next) {
  try {
    const { name, location } = req.body || {};
    if (!name || !location) {
      return res.status(400).json({ error: "name and location are required" });
    }

    const hospital = await queueService.createHospital({ name, location });
    res.status(201).json(hospital);
  } catch (err) {
    next(err);
  }
}

async function listHospitals(req, res, next) {
  try {
    const hospitals = await queueService.listHospitals({ query: req.query.q });
    res.json(hospitals);
  } catch (err) {
    next(err);
  }
}

module.exports = { createHospital, listHospitals };

