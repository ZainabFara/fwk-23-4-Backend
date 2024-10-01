const app = require('./app.js'); // Import your express configuration
const { onRequest } = require("firebase-functions/v2/https");
const cors = require('cors');

// Set up CORS in index.js
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true // Allow credentials if necessary
}));

// Export the Firebase function
exports.api = onRequest(app);
