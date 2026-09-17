const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

const coinsRouter = require('./routes/coins');
app.use('/api/coins', coinsRouter);

const historyRouter = require('./routes/history');
app.use('/api/coins/history', historyRouter);

