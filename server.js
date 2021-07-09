const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
import {errorHandler,notFound} from './middleware/error';
const connectDB = require('./config/db');
// Load env vars
dotenv.config({ path: '.env' });

// Connect to database
connectDB();

// Route files
const auth = require("./routes/auth");
const upload = require("./routes/upload");
import project from './routes/project'




const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading


// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet.hidePoweredBy());

// Prevent XSS attacks
// app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());


// Mount routers
app.use('/api/auth', auth);
app.use('/api/upload', upload);
app.use('/api/projects',project)
app.use(notFound);
app.use(errorHandler);



const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});