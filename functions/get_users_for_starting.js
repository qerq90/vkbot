const User = require("../schemas/user");

module.exports = async user_ids => {
    let users = await User.find();
    users = users.filter(el => user_ids.include(el.id));
    users = users.filter(el => el.getting_starting_event);
    return users;
};
