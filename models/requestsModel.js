const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    tableNumber: { type: Number, required: true },
    queryCategory: { type: String, required: true },
    status: { type: String, default: "pending" }
})

module.exports = mongoose.model("mentorRequest", requestSchema);