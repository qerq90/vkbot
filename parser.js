const needle = require("needle");
const mongoose = require("mongoose");

const { get_event } = require("./functions");

const url_game = "https://server.webdiplomacy.ru/gamelistings.php";

require("dotenv").config();

let already_proccesed = [];
let already_proccesed_active = [];

mongoose
    .connect(process.env.MONGOTOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Mongo started"));

function get_events() {
    needle.get(url_game, async (err, res) => {
        const map_link_regex = /<a href="(.+)">Просмотр/gm;
        let all_a = map_link_regex.exec(res.body);
        if (all_a == null) return;

        let links = ["https://server.webdiplomacy.ru/" + all_a[1]];
        while ((all_a = map_link_regex.exec(res.body)) !== null) {
            let link = "https://server.webdiplomacy.ru/" + all_a[1];
            links.push(link);
        }

        for (const link of links) {
            if (already_proccesed.includes(link)) continue;
            get_event(link);

            already_proccesed.push(link);
        }
    });
}

setInterval(() => {
    get_events();
}, 10000);
