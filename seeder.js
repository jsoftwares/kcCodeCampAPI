const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config({path: './.env'});
const Bootcamp = require('./src/models/Bootcamp');
const Course = require('./src/models/Course');
const User = require('./src/models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
});

// Read JSON file
const bootcamps = JSON.parse(fs.readFileSync(__dirname + '/_data/bootcamps.json', 'utf-8'));
const courses = JSON.parse(fs.readFileSync(__dirname + '/_data/courses.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync(__dirname + '/_data/users.json', 'utf-8'));

// Import bootcamps to DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        console.log('Data Imported...');
        process.exit();
    } catch (err) {
        console.error(err);
    }
};


// Delete bootcamps from DB
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed...');
        process.exit();
    } catch (err) {
        console.error(err);
    }
};

if (process.argv[2] === '-i') {
    importData();
} else if(process.argv[2] === '-d') {
    deleteData();
}

// To run this seeder we do so from Terminal using CMD -> NODE SEEDERFILENAME -i to import & -d to destroy
// eg node seeder -i