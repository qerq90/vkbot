const fs = require("fs");

module.exports = text => {
    fs.appendFileSync("log.txt", text + "\n");
};
