const environment = process.env.ENVIRONMENT;

let database = null; 
if (environment === 'dev') {
    database = `mongodb://localhost:27017/Timexio?readPreference=primary&appname=MongoDB%20Compass&ssl=false`;
} else if (environment === 'production') {
    database = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.j425t.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
}

module.exports = database;