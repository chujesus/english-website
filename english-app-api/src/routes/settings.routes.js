const { Router } = require("express");
const {
  getAllSettings,
  getSettingByName,
  createSetting,
  updateSetting,
  deleteSetting,
} = require("../controllers/settings");

const router = Router();

// GET all settings
router.get("/", getAllSettings);

// GET setting by name
router.get("/name/:name", getSettingByName);

// POST create new setting
router.post("/", createSetting);

// PUT update setting
router.put("/:id", updateSetting);

// DELETE setting
router.delete("/:id", deleteSetting);

module.exports = router;
