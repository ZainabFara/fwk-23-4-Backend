require('dotenv').config();
const app = require('./app.js');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`http server listening on port ${PORT}`);
});
