const mongoose = require('mongoose');

const productItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  grade: { type: String },
  gradePrice: { type: Number },
  priceWithoutGrade: { type: Number },
  totalPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  weight: { type: Number },
});

const productSchema = new mongoose.Schema(
  {
    farmerContact: { type: String, required: true },
    farmerName: { type: String, required: true },
    traderName: { type: String, required: true },
    deliveryWay: {
      type: String,
      required: true,
      enum: ["delivered", "dropped"],
      lowercase: true,
    },
    vehicleName: { type: String },
    vehicleNumber: { type: String },
    vehiclePhoto: { type: String },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["paid", "unpaid"],
      lowercase: true,
      default: "unpaid",
    },
    BillType: { type: String, enum: ["G4", "Shimla"], required: true },
    traderId: { type: mongoose.Schema.Types.ObjectId, ref: "Trader" },

 
    products: [productItemSchema],

    overAlltotalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
