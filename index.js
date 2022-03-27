require("dotenv").config();
const dirTree = require("directory-tree");
const express = require("express");
const app = express();

const options = {
    extensions: /\.md/,
    attributes: ["type"],
};
const tree = dirTree(process.env.VAULT_PATH, options);

app.get("/", function (req, res) {
    res.send("hello");
});
console.log(`Listening on port ${process.env.PORT}`);
app.listen(process.env.PORT);
