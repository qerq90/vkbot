require("dotenv").config();
const api = require("node-vk-bot-api/lib/api");

module.exports = (event_info, user_ids) => {
    if (!user_ids.length) return;
    try {
        api("messages.send", {
            message: event_info,
            user_ids: user_ids.toString(),
            random_id: 0,
            access_token: process.env.TOKEN
        });
    } catch (err) {
        console.log(err);
    }
};
