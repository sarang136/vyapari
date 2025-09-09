const express = require('express');
const connectDb = require('./database/db');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const traderRouter = require('./routes/traderRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
app.use(express.json());
app.use(cookieParser());

app.use('/trader', traderRouter)
app.use('/farmer', farmerRoutes)



connectDb()
  .then(() => {
    console.log("Database Connected");
    app.listen(3000, () => {
      console.log(`Server started on port 3000`);
    });
  })
  .catch((error) => {
    console.log("DB Connection Error:", error);
  });