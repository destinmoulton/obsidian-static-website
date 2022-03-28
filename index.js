require("dotenv").config();
const dirTree = require("directory-tree");
const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const path = require("path");
const slugify = require("slugify");

//app.set("views", "./public");
nunjucks.configure(path.resolve(__dirname, "public", "views"), {
    autoescape: true,
    express: app,
});

const options = {
    extensions: /\.md/,
    attributes: ["type"],
    exclude: /.*\/\..*/,
};
const slugger = (item, path) => {
    // Strip the file extension
    const noExtension = item.name.replace(/\.[^/.]+$/, "");
    item.slug = slugify(noExtension);
};
const tree = dirTree(process.env.VAULT_PATH, options, slugger, slugger);
console.log(tree.children[0]);
app.get("/*", function (req, res) {
    console.log(req.url);
    res.render("index.html", { tree: tree });
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
