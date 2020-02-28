mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: String,
    write_perm: Boolean,
    forb_maps: Array,
    watching: Array,
    duel_off: Boolean,
    type_of_events: Number, //! 0 - only blutz , 1 - only longs , 2 - blutz + longs
    getting_starting_event: Boolean
});
module.exports = new mongoose.model("User", UserSchema);
