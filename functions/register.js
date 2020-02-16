User = require("../schemas/user");

module.exports = async usr_id => {
    let user = new User({
        id: usr_id,
        write_perm: true,
        forb_maps: [],
        muted_till: new Date(),
        duel_off: false,
        type_of_events: 2
    });

    user.save();
};
