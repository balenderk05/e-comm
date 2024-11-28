const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const adminAuth = require('./routes/adminRoutes');


const db = require('./db');

// const bcrypt = require('bcrypt');

require('dotenv').config();



app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', function (req, res){
    res.send('Welcome to my hotel..')
});

// Routes
app.use('/user', userRoutes);
app.use('/', adminRoutes, adminAuth);



app.listen(PORT, ()=>{
    console.log('listening on port 3000');
}) ;