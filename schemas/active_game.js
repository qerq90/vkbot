mongoose = require("mongoose");

const ActiveGameSchema = new mongoose.Schema({
    name: String,
    time_remaining: String,
    url: String,
    id: Number
});
module.exports = new mongoose.model("ActiveGame", ActiveGameSchema);
