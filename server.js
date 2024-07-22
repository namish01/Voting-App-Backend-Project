const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

const userRoutes = require('./routes/userRoutes');
const CandidateRoute=require('./routes/candidateRoutes');
app.use('/user', userRoutes);
app.use('/candidate',CandidateRoute);

app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})