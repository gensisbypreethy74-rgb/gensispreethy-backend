import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order';
import { Product } from '../models/Product';
import dotenv from 'dotenv';
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Create Order — Only creates a Razorpay order, does NOT save to DB yet
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { total } = req.body;
    
    let razorpayOrder;
    let isMock = false;

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_key_id') {
      razorpayOrder = {
        id: `mock_order_${Date.now()}`,
        amount: Math.round(total * 100),
        currency: 'INR'
      };
      isMock = true;
    } else {
      const options = {
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
      };
      razorpayOrder = await razorpayInstance.orders.create(options);
    }

    // No DB save here — order saved only after payment verified
    res.status(200).json({
      success: true,
      data: { razorpayOrder, isMock }
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating order' });
  }
};

// Verify Payment — Saves order to DB only after payment is confirmed
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      subtotal,
      discount,
      shippingFee,
      total,
    } = req.body;

    let paymentVerified = false;

    if (razorpay_payment_id === 'mock_payment') {
      paymentVerified = true;
    } else {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
        .update(sign.toString())
        .digest("hex");
      paymentVerified = razorpay_signature === expectedSign;
    }

    if (paymentVerified) {
      // Payment confirmed — NOW save order to DB
      const newOrder = new Order({
        user: req.user?._id,
        items,
        shippingAddress,
        subtotal,
        discount,
        shippingFee,
        total,
        paymentMethod: 'razorpay',
        paymentStatus: 'completed',
        orderStatus: 'processing',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_payment_id === 'mock_payment' ? 'mock_signature' : razorpay_signature,
      });

      await newOrder.save();

      // Deduct stock for each purchased item
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        if (item.size) {
          // Deduct from the specific variant that matches the size/volume
          const variantIndex = product.variants.findIndex(
            (v) => v.volume === item.size
          );
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock = Math.max(
              0,
              product.variants[variantIndex].stock - item.quantity
            );
          }
        } else {
          // No size info — deduct from first variant
          if (product.variants.length > 0) {
            product.variants[0].stock = Math.max(
              0,
              product.variants[0].stock - item.quantity
            );
          }
        }
        await product.save();
      }

      res.status(200).json({
        success: true,
        message: "Payment verified and order placed successfully",
        data: newOrder
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature. Payment verification failed." });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message || 'Error verifying payment' });
  }
};

// Get My Orders
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching orders' });
  }
};

// Admin: Get All Orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name images variants')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching all orders' });
  }
};

// Admin: Update Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    ).populate('user', 'name email phone')
     .populate('items.product', 'name images variants');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating order status' });
  }
};
