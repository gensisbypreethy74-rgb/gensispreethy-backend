import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, errorResponse } from '../utils/responseHandler';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // Normalize req.body.images to array if present
  if (req.body.images) {
    if (typeof req.body.images === 'string') {
      req.body.images = [req.body.images];
    }
  } else {
    req.body.images = [];
  }

  if (req.files && Array.isArray(req.files)) {
    const fileUrls = req.files.map(file => file.path);
    req.body.images = [...req.body.images, ...fileUrls];
  }

  // Handle variants parsing if sent as a string (from FormData)
  if (typeof req.body.variants === 'string') {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (e) {
      // do nothing, let validator catch it
    }
  }

  const product = await Product.create(req.body);
  successResponse(res, 201, 'Product created successfully', product);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find().sort({ createdAt: -1 });
  successResponse(res, 200, 'Products fetched successfully', products);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return errorResponse(res, 404, 'Product not found');
  }
  
  // Normalize req.body.images to array if present
  if (req.body.images) {
    if (typeof req.body.images === 'string') {
      req.body.images = [req.body.images];
    }
  } else {
    req.body.images = [];
  }

  if (req.files && Array.isArray(req.files)) {
    const fileUrls = req.files.map(file => file.path);
    req.body.images = [...req.body.images, ...fileUrls];
  }

  if (typeof req.body.variants === 'string') {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (e) {
      // do nothing
    }
  }
  
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  successResponse(res, 200, 'Product updated successfully', product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return errorResponse(res, 404, 'Product not found');
  }
  successResponse(res, 200, 'Product deleted successfully', null);
});
