const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const rateLimit = require("express-rate-limit");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); 

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login/signup attempts per 15 min
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
});

const connectionRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 connection requests per hour
  message: { error: "Connection request limit reached. Try again later." },
});

app.use(generalLimiter);

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

// Apply specific rate limiters
app.use("/login", authLimiter);
app.use("/signup", authLimiter);
app.use("/request/send", connectionRequestLimiter);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);
const userBlockRouter = require("./routes/block");
app.use("/", userBlockRouter);
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    server.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  }) 
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });