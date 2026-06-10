"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const Settings_1 = require("../models/Settings");
const asyncHandler_1 = require("../utils/asyncHandler");
const responseHandler_1 = require("../utils/responseHandler");
exports.getSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let settings = await Settings_1.Settings.findOne();
    if (!settings) {
        settings = await Settings_1.Settings.create({});
    }
    (0, responseHandler_1.successResponse)(res, 200, 'Settings fetched successfully', settings);
});
exports.updateSettings = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let settings = await Settings_1.Settings.findOne();
    if (!settings) {
        settings = await Settings_1.Settings.create(req.body);
    }
    else {
        settings = await Settings_1.Settings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }
    (0, responseHandler_1.successResponse)(res, 200, 'Settings updated successfully', settings);
});
//# sourceMappingURL=settingsController.js.map