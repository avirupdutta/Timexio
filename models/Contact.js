const mongoose = require("mongoose");
const moment = require("moment");

const contactSchema = new mongoose.Schema({
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
        required: false,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        default: () => moment().format("Do MMMM, YYYY"),
    },
    byRegisteredUser: {
        type: Boolean,
        required: true,
    },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
