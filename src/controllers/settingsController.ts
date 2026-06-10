import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/responseHandler';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  successResponse(res, 200, 'Settings fetched successfully', settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
  }
  successResponse(res, 200, 'Settings updated successfully', settings);
});
