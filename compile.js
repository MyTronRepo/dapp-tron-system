const fs = require("fs");
const solc = require("solc");

const input = fs.readFileSync(
    "compile-input.json",
    "utf8"
);

const output = JSON.parse(
    solc.compile(input)
);

fs.writeFileSync(
    "compile-output.json",
    JSON.stringify(output, null, 2)
);

console.log("Compilation finished");