const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config({path: './.env'});

const bootcampsRoutes = require('./routes/bootcamps');
const errorHandler = require('./middlewares/error-handler');

const PORT = process.env.PORT || 3000; 
const app = express();

// Body parser
app.use(express.json());

// Routes 
app.use('/api/v1/bootcamps', bootcampsRoutes);

// Middleware
app.use(errorHandler);



const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, 
        });
        console.log('KCCodeCampAPI connected to MongoDB');
        app.listen(PORT, () => console.log('KCCodeCampAPI server is running on Port ', PORT ));
        
        
    } catch (err) {
        console.error(err);
    }

}

start();