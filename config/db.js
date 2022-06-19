const settings = require("../settings");
const environment = process.env.ENVIRONMENT;

let database = null;
if (environment === settings.serverEnv.DEVELOPMENT) {
    database = `mongodb://localhost:27017/Timexio?readPreference=primary&appname=MongoDB%20Compass&ssl=false`;
} else if (environment === settings.serverEnv.PRODUCTION) {
    database = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.jzhiy.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
}

module.exports = database;

//mongodb+srv://admin:<password>@cluster0.jzhiy.mongodb.net/<dbname>?retryWrites=true&w=majority
