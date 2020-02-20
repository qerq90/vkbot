const User = require("../schemas/user");

module.exports = async user_ids => {
    let users = await User.find();
    users = users.filter(el => user_ids.includes(el.id));
    users = users.filter(el => el.getting_starting_event);
    return users;
};
