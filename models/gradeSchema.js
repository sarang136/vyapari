const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  traderId: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: "Trader",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Grade", gradeSchema);
