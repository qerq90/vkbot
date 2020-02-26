mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    name: String,
    map: String,
    time_remaining: String,
    starting_time: Date,
    player_number: String,
    url: String,
    id: Number,
    type: Boolean,
    time_for_move: String,
    already_processed: Boolean
});
module.exports = new mongoose.model("Event", EventSchema);
