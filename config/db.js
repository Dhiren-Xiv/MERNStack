const mongooes = require('mongoose');
const config = require('config');

const db = config.get("mongoURI");

const connectDB = async () => {
    try {
        await mongooes.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Mongo Conected")
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = connectDB;