// Module dependencies
const express = require('express');
const { Router, json } = require('express');
require('dotenv').config();
const router = Router();
const cors = require('cors');

// Init app and export app server
const app = express();

// DB Connection
//dbConnection();

// Cors
let allowedOriginsArray = [];
allowedOriginsArray = JSON.parse(process.env.ALLOWEDORIGINGS);
let corsOptions = {
    origin: allowedOriginsArray.map((corsOrigin) => corsOrigin)
};
app.use(cors(corsOptions));

// Get json from app client or to parse the incoming requests with JSON payloads
app.use(json());

// Public Directory
app.use(express.static('public'));

// Routes
app.use('/auths', require('./src/routes/auth.routes'));
app.use('/courses', require('./src/routes/course.routes'));
app.use('/students', require('./src/routes/student.routes'));

// Exports router
module.exports = { router };

// Run server
app.listen(process.env.PORT || 3001, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});