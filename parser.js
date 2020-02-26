const needle = require("needle");
const mongoose = require("mongoose");

const ActiveGame = require("./schemas/active_game");
const Event = require("./schemas/event");

const { get_event, send_message } = require("./functions");

const url_game = "https://server.webdiplomacy.ru/gamelistings.php";

require("dotenv").config();

let already_proccesed;

mongoose
    .connect(process.env.MONGOTOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(async () => {
        console.log("Mongo started");
        already_proccesed = await Event.find();
        already_proccesed = already_proccesed.map(el => el.url);
    });

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

                let links = ["https://server.webdiplomacy.ru/" + all_a[1]];

                while ((all_a = map_link_regex.exec(res.body)) !== null) {
                    let link = "https://server.webdiplomacy.ru/" + all_a[1];
                    links.push(link);
                }

                for (const link of links) {
                    let result = await needle("get", link);

                    let event_id_regex = /gameID=(\d*)#/;
                    let event_id = event_id_regex.exec(link)[1];

                    const name_regex = /<span class="gameName">(.+?)<\/span>/;
                    let name = name_regex.exec(result.body)[1];

                    const time_remaining_regex = /<span class="timeremaining" unixtime="(\d*)" unixtimefrom=/;
                    let start_time;
                    // последние 5 секунд другой тег,но нам уже все равно
                    try {
                        start_time = time_remaining_regex.exec(result.body)[1];
                    } catch (err) {
                        continue;
                    }

                    if (activeGames.map(el => el.id).includes(event_id)) {
                        game = activeGames.filter(el => el.id == event.id)[0];
                        if (
                            new Date(game.time_remaining).getTime() !=
                            new Date(start_time * 1000).getTime()
                        ) {
                            let users = await User.find();

                            users = users.filter(el =>
                                el.watching.includes(game.id)
                            );

                            let user_ids = users.map(el => el.id);

                            send_message(
                                `В игре '${game.name}' был сделан новый ход`,
                                user_ids
                            );

                            await ActiveGame.deleteOne(game);
                        }
                    } else {
                        let activeGame = new ActiveGame({
                            name: name,
                            time_remaining: new Date(start_time * 1000),
                            url: link,
                            id: event_id
                        });

                        await activeGame.save();
                    }
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
}, 30000);
