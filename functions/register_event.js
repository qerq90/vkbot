const needle = require("needle");
const Event = require("../schemas/event");
const Types = require("../json/types.json");

module.exports = async link => {
    let res = await needle("get", link);
    let event_id_regex = /gameID=(\d*)#/;
    let event_id = event_id_regex.exec(link)[1];

    const name_regex = /<span class="gameName">(.+?)<\/span>/;
    let result_map = name_regex.exec(res.body);

    if (result_map == null) name = "Classic";

    const time_remaining_regex = /<span class="timeremaining" unixtime="(\d*)" unixtimefrom="\d*">(.+?)<\/span>/;
    let start_time = time_remaining_regex.exec(res.body)[1];
    let time_remaining = time_remaining_regex.exec(res.body)[2];

    const time_for_move_regex = /<span class="gameHoursPerPhase">\s*<strong>(.*?)<\/strong>/;
    let time_for_move = time_for_move_regex.exec(res.body)[1];

    const map_name_regex = /<a class="light".*?>(.*?)<\/a>/;
    let map_name = map_name_regex.exec(res.body)[1];

    const player_number_regex = /<span class="gamePhase"><b>\d+?<\/b>(.*?)<\/span>/;
    let player_number = player_number_regex.exec(res.body)[1];
    player_number = "1" + player_number;

    let type = Types[time_for_move] === undefined ? 1 : Types[time_for_move];

    const event = new Event({
        name: name,
        map: map_name,
        time_remaining: time_remaining,
        starting_time: new Date(start_time * 1000),
        player_number: player_number,
        url: link,
        id: event_id,
        time_for_move: time_for_move,
        type: type
    });

    event.save();
};
