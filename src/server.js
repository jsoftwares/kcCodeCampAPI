const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const dotenv = require('dotenv').config({path: './.env'});
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error-handler');

const bootcampsRouter = require('./routes/bootcamps');
const coursesRouter = require('./routes/courses');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const reviewsRouter = require('./routes/reviews');

const PORT = process.env.PORT || 3000; 
const app = express();

// Body parser
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());
// Set static folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes 
app.use('/api/v1/bootcamps', bootcampsRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

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