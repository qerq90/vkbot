const needle = require("needle");

const ActiveGame = require("../schemas/active_game");

module.exports = async function get_active_games() {
    let url_all_games_1 =
        "https://server.webdiplomacy.ru/gamelistings.php?page-games=";
    let url_all_games_2 = "&gamelistType=Active";
    for (let i = 1; i < 100; i++) {
        needle.get(
            url_all_games_1 + `${i}` + url_all_games_2,
            async (err, res) => {
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
                    already_proccesed_active.push(link);

                    let res = await needle("get", link);
                    let event_id_regex = /gameID=(\d*)#/;
                    let event_id = event_id_regex.exec(link)[1];

                    const name_regex = /<span class="gameName">(.+?)<\/span>/;
                    let name = name_regex.exec(res.body)[1];

                    const time_remaining_regex = /<span class="timeremaining" unixtime="(\d*)" unixtimefrom="\d*">(.+?)<\/span>/;
                    let try_time = time_remaining_regex.exec(res.body);
                    if (try_time == null) continue;
                    let time_remaining = try_time[1];

                    const game = new ActiveGame({
                        name: name,
                        time_remaining: time_remaining,
                        url: link,
                        id: event_id
                    });

                    game.save();
                }
            }
        );
    }
};
