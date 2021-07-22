const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const dotenv = require('dotenv').config({path: './.env'});

const bootcampRouter = require('./routes/bootcamps');
const courseRouter = require('./routes/courses');
const authRouter = require('./routes/auth');

const errorHandler = require('./middlewares/error-handler');

const PORT = process.env.PORT || 3000; 
const app = express();

// Body parser
app.use(express.json());

// File uploading
app.use(fileupload());
// Set static folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes 
app.use('/api/v1/bootcamps', bootcampRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/auth', authRouter);

// Middleware
app.use(errorHandler);



const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
        });
        console.log('KCCodeCampAPI connected to MongoDB');
        app.listen(PORT, () => console.log('KCCodeCampAPI server is running on Port ', PORT ));
        
        
    } catch (err) {
        console.error(err);
    }

}

start();