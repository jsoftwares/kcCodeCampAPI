const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config({path: './.env'});
const Bootcamp = require('./src/models/Bootcamp');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
});

// Read JSON file
const bootcamps = JSON.parse(fs.readFileSync(__dirname + '/_data/bootcamps.json', 'utf-8'));

// Import bootcamps to DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
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