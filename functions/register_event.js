const needle = require("needle");
const Event = require("../schemas/event");
const Types = require("../json/types.json");

module.exports = async link => {
    let res = await needle("get", link);
    let event_id_regex = /gameID=(\d*)#/;
    let event_id = event_id_regex.exec(link)[1];

    const name_regex = /<span class="gameName">(.+?)<\/span>/;
    let name = name_regex.exec(res.body)[1];

    const time_remaining_regex = /<span class="timeremaining" unixtime="(\d*)" unixtimefrom="\d*">(.+?)<\/span>/;
    let start_time = time_remaining_regex.exec(res.body)[1];
    let time_remaining = time_remaining_regex.exec(res.body)[2];

    const time_for_move_regex = /<span class="gameHoursPerPhase">\s*<strong>(.*?)<\/strong>/;
    let time_for_move = time_for_move_regex.exec(res.body)[1];

    const map_name_regex = /"gamePotType"><a class="light".*?>(.*?)<\/a>/;
    let result_map = map_name_regex.exec(res.body);
    let map_name = result_map == null ? "Classic" : result_map[1];

    const player_number_regex = /<span class="gamePhase"><b>(\d+?)<\/b>(.*?)<\/span>/;
    let num = player_number_regex.exec(res.body)[1];
    let player_number = player_number_regex.exec(res.body)[2];
    player_number = num + player_number;

    let type = Types[time_for_move] === undefined ? 1 : Types[time_for_move];

    const event = new Event({
        name: name,
        map: map_name,
        time_remaining: time_remaining,
        starting_time: new Date((Number(start_time) + 480 * 60) * 1000), // небольшой костыль из-за разницы в часовых поясах
        player_number: player_number,
        url: link,
        id: event_id,
        time_for_move: time_for_move,
        type: type,
        already_processed: false
    });

    event.save();
};
