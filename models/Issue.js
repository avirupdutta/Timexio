const mongoose = require("mongoose");
const moment = require("moment");

const issueSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    openedDate: {
        type: String,
        default: () => moment().format("Do MMMM, YYYY"),
    },
    closedDate: {
        type: String,
        default: null,
    },
});

const Issue = mongoose.model("Issues", issueSchema);

module.exports = Issue;
