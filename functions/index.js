const app = require('./app.js'); 
const { onRequest } = require("firebase-functions/v2/https");
const cors = require('cors');

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true 
}));

exports.api = onRequest({
    region: 'europe-west1'
}, app);