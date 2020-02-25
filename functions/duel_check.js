const User = require("../schemas/user");

module.exports = async (user_ids, event_info) => {
    if (event_info.match(/\(из (\d*)\)/)) {
        number = event_info.match(/\(из (\d*)\)/)[1];
        if (number != 2) return user_ids;

        let users = await User.find();
        users = users.filter(el => user_ids.includes(el.id));
        return users.filter(el => !el.duel_off).map(el => el.id);
    }
    return user_ids;
};
