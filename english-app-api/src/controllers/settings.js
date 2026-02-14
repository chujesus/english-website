const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");

const getAllSettings = async (req, res = response) => {
  try {
    const [settings] = await pool.query("SELECT * FROM settings ORDER BY name ASC");

    return res.json({
      ok: true,
      data: settings || [],
      message:
        settings.length > 0
          ? "Settings retrieved successfully"
          : "No settings found",
    });
  } catch (error) {
    console.error("Error getting settings data:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Internal server error",
    });
  }
};

const getSettingByName = async (req, res = response) => {
  try {
    const { name } = req.params;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "Setting name is required",
      });
    }

    const [settings] = await pool.query(
      "SELECT * FROM settings WHERE name = ? LIMIT 1",
      [name]
    );

    if (settings.length === 0) {
      return res.status(404).json({
        ok: false,
        data: null,
        message: "Setting not found",
      });
    }

    return res.json({
      ok: true,
      data: settings[0],
      message: "Setting retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting setting by name:", error);
    return res.status(500).json({
      ok: false,
      data: null,
      message: "Internal server error",
    });
  }
};

const createSetting = async (req, res = response) => {
  try {
    const { name, value } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "Setting name is required",
      });
    }

    // Check if setting already exists
    const [existing] = await pool.query(
      "SELECT id FROM settings WHERE name = ? LIMIT 1",
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        ok: false,
        data: null,
        message: "Setting with this name already exists",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO settings (name, value) VALUES (?, ?)",
      [name, value || null]
    );

    const [newSetting] = await pool.query(
      "SELECT * FROM settings WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      data: newSetting[0],
      message: "Setting created successfully",
    });
  } catch (error) {
    console.error("Error creating setting:", error);
    return res.status(500).json({
      ok: false,
      data: null,
      message: "Internal server error",
    });
  }
};

const updateSetting = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { name, value } = req.body;

    if (!id) {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "Setting ID is required",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "Setting name is required",
      });
    }

    // Check if setting exists
    const [existing] = await pool.query(
      "SELECT id FROM settings WHERE id = ? LIMIT 1",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        ok: false,
        data: null,
        message: "Setting not found",
      });
    }

    // Check if new name is already taken by another setting
    const [duplicate] = await pool.query(
      "SELECT id FROM settings WHERE name = ? AND id != ? LIMIT 1",
      [name, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        ok: false,
        data: null,
        message: "Setting with this name already exists",
      });
    }

    await pool.query("UPDATE settings SET name = ?, value = ? WHERE id = ?", [
      name,
      value || null,
      id,
    ]);

    const [updatedSetting] = await pool.query(
      "SELECT * FROM settings WHERE id = ?",
      [id]
    );

    return res.json({
      ok: true,
      data: updatedSetting[0],
      message: "Setting updated successfully",
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    return res.status(500).json({
      ok: false,
      data: null,
      message: "Internal server error",
    });
  }
};

const deleteSetting = async (req, res = response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        data: null,
        message: "Setting ID is required",
      });
    }

    // Check if setting exists
    const [existing] = await pool.query(
      "SELECT id FROM settings WHERE id = ? LIMIT 1",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        ok: false,
        data: null,
        message: "Setting not found",
      });
    }

    await pool.query("DELETE FROM settings WHERE id = ?", [id]);

    return res.json({
      ok: true,
      data: null,
      message: "Setting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return res.status(500).json({
      ok: false,
      data: null,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllSettings,
  getSettingByName,
  createSetting,
  updateSetting,
  deleteSetting,
};
