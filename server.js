const express = require('express');
const connectDb = require('./database/db');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const traderRouter = require('./routes/traderRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const cors = require('cors');
const adminRouter = require('./routes/adminRoutes');
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH" , "UPDATE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

app.use('/trader', traderRouter)
app.use('/farmer', farmerRoutes)
app.use('/admin', adminRouter)

let PORT = process.env.PORT || 5000
console.log("PORT", PORT)

connectDb()
  .then(() => {
    console.log("Database Connected");
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("DB Connection Error:", error);
  });