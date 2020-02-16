const maps = require("../json/map_names.json");

module.exports = (users, event) => {
    let user_ids = [];
    let event_type = event.type ? 1 : 0;
    let map_id;

    maps.forEach(el => {
        if (el.name == event.map) map_id = el.id;
    });

    for (const user of users) {
        if (user.write_perm) {
            if (user.type_of_events == 2 || user.type_of_events == event_type) {
                if (!user.forb_maps.includes(map_id)) {
                    user_ids.push(user.id);
                }
            }
        }
    }

    return user_ids;
};
