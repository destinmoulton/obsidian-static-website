const path = require("path");
const fs = require("fs");

require("dotenv").config();
const dirTree = require("directory-tree");
const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const slugify = require("slugify");
const { Remarkable } = require("remarkable");
const md = new Remarkable();
const stripYamlHeader = require("./lib/strip-yaml-header");
app.use(express.static("public"));

let menuHTML = "";
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
    const shortPath = item.path.replace(process.env.VAULT_PATH + "/", "");
    const pathParts = shortPath.split("/");
    let slugPath = "";
    if (item.type === "file") {
        // Get rid of any quotes in the non extension version
        pathParts[pathParts.length - 1] = noExtension.replace("'", "");
    }
    for (let part of pathParts) {
        slugPath += "/" + slugify(part);
    }
    item.name_without_extension = noExtension;
    item.slug = slugify(noExtension);
    item.slug_path = slugPath;
};
const tree = dirTree(process.env.VAULT_PATH, options, slugger, slugger);
console.log(tree.children[0]);
recursiveHTMLTree(tree.children);
app.get("/*", function (req, res) {
    let contents = "";
    if (req.url !== "/") {
        const path = recursiveFindPath(tree.children, req.url);
        if (path !== null) {
            contents = fs.readFileSync(path, "utf8");
            // Strip yaml header
            contents = stripYamlHeader(contents);
            // Render markdown to html
            contents = md.render(contents);
        }
    }
    res.render("index.html", { tree: menuHTML, contents: contents });
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
function recursiveHTMLTree(children) {
    menuHTML += "<ul>";
    for (let child of children) {
        if (child.type === "directory" && child.children.length > 0) {
            menuHTML += "<li><span>" + child.name + "</span>";
            recursiveHTMLTree(child.children);
            menuHTML += "</li>";
        } else if (child.type === "file") {
            menuHTML +=
                "<li><a href='" +
                child.slug_path +
                "'>" +
                child.name_without_extension +
                "</a></li>";
        }
    }
    menuHTML += "</ul>";
}

function recursiveFindPath(children, path_slug_needle) {
    for (let child of children) {
        if (child.type === "directory" && child.children.length > 0) {
            const found = recursiveFindPath(child.children, path_slug_needle);
            if (found !== null) {
                return found;
            }
        } else if (child.type === "file") {
            if (child.slug_path === path_slug_needle) {
                return child.path;
            }
        }
    }
    return null;
}
