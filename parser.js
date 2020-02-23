const needle = require("needle");
const mongoose = require("mongoose");

const ActiveGame = require("./schemas/active_game");

const { get_event } = require("./functions");

const url_game = "https://server.webdiplomacy.ru/gamelistings.php";

require("dotenv").config();

let already_proccesed = [];

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

async function get_active_games() {
    for (let j = 1; j < 10; j++) {
        let activeGames = await ActiveGame.find();
        let activeGames_links = activeGames.map(el => el.url);

        needle.get(
            `https://server.webdiplomacy.ru/gamelistings.php?gamelistType=Active&page-games=${j}`,
            async (err, res) => {
                if (err) {
                    console.log(err);
                    return;
                }

                const map_link_regex = /<a href="(.+)">Просмотр/g;
                let all_a = map_link_regex.exec(res.body);
                if (all_a == null) return;

                let links = [];
                if (
                    activeGames_links.includes(
                        "https://server.webdiplomacy.ru/" + all_a[1]
                    )
                ) {
                    links = [];
                } else {
                    links = ["https://server.webdiplomacy.ru/" + all_a[1]];
                }

                while ((all_a = map_link_regex.exec(res.body)) !== null) {
                    let link = "https://server.webdiplomacy.ru/" + all_a[1];
                    if (activeGames_links.includes(link)) {
                        continue;
                    } else {
                        links.push(link);
                    }
                }

                for (const link of links) {
                    let result = await needle("get", link);

                    let event_id_regex = /gameID=(\d*)#/;
                    let event_id = event_id_regex.exec(link)[1];

                    const name_regex = /<span class="gameName">(.+?)<\/span>/;
                    let name = name_regex.exec(result.body)[1];

                    const time_remaining_regex = /<span class="timeremaining" unixtime="(\d*)" unixtimefrom="\d*">(.+?)<\/span>/;
                    let start_time;
                    try {
                        start_time = time_remaining_regex.exec(result.body)[1];
                    } catch (err) {
                        start_time = 0;
                        console.log(link);
                    }

                    let activeGame = new ActiveGame({
                        name: name,
                        time_remaining: new Date(start_time * 1000),
                        url: link,
                        id: event_id
                    });

                    await activeGame.save();
                }
            }
        );
    }
}

setInterval(() => {
    get_events();
}, 10000);

setInterval(() => {
    get_active_games();
}, 10000);
