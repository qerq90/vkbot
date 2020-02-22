const Scene = require("node-vk-bot-api/lib/scene");
const Stage = require("node-vk-bot-api/lib/stage");

const map_names = require("../json/map_names.json");
const replies = require("../json/replies.json");

const User = require("../schemas/user");

//-----------------------------
let all_maps = "";
map_names.forEach(map_obj => {
    all_maps += `${map_obj.id})${map_obj.name}\n`;
});
all_maps.trim();
//-----------------------------
const scene_type_change = new Scene(
    "change_type",
    async ctx => {
        ctx.scene.next();
        ctx.reply(replies.change_type_choice);
    },
    async ctx => {
        ctx.scene.leave();
        let usr_msg = ctx.message.text;
        let usr_id = ctx.message.from_id;

        if (usr_msg.match(/^\d+$/) === null) {
            ctx.reply(replies.bad_number);
            return;
        }

        let message = Number(usr_msg.match(/^\d+$/)[0]);
        if (message > 2 || message < 0) return ctx.reply(replies.bad_number);

        let user = await User.findOne({ id: usr_id });
        user.type_of_events = message;
        user.save();
        ctx.reply(replies.type_changed);
    }
);

const scene_ban_map = new Scene(
    "ban_map",
    ctx => {
        ctx.scene.next();
        ctx.reply(replies.map_1 + "\n" + all_maps);
    },
    async ctx => {
        ctx.scene.leave();
        let message = ctx.message.text;
        let usr_id = ctx.message.from_id;

        if (message.match(/^\d+$/) === null) {
            ctx.reply(replies.bad_map);
            return;
        }

        let map = message.match(/^\d+$/)[0];

        if (map > 108 || map === 0) return ctx.reply(replies.bad_map);

        let user = await User.findOne({ id: usr_id });
        user.forb_maps.push(map);
        user.save();
        ctx.reply(replies.ban_map_succes);
    }
);

const scene_unban_map = new Scene(
    "unban_map",
    async ctx => {
        ctx.scene.next();
        let user = await User.findOne({ id: ctx.message.from_id });
        let maps = map_names.filter(map => user.forb_maps.includes(map.id));
        let forb_m = "";
        maps.forEach(map_obj => {
            forb_m += `${map_obj.id})${map_obj.name}\n`;
        });
        ctx.reply(replies.map_2 + "\n" + forb_m);
    },
    async ctx => {
        ctx.scene.leave();
        let message = ctx.message.text;
        let usr_id = ctx.message.from_id;

        if (message.match(/^\d+$/) === null) {
            ctx.reply(replies.bad_map);
            return;
        }

        let map = message.match(/^\d+$/)[0];
        let user = await User.findOne({ id: usr_id });

        if (!user.forb_maps.includes(map)) {
            ctx.reply(replies.bad_map);
            return;
        }

        user.forb_maps = user.forb_maps.filter(id => id != map);
        user.save();
        ctx.reply(replies.unban_map_succes);
    }
);
//-------------------------------
const stage = new Stage(scene_ban_map, scene_unban_map, scene_type_change);

module.exports = stage;
