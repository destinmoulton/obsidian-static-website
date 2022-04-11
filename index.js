const path = require("path");
const fs = require("fs");

require("dotenv").config();
const dirTree = require("directory-tree");
const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const slugify = require("slugify");
const yamlFMatter = require("yaml-front-matter");
const { Remarkable } = require("remarkable");
const md = new Remarkable({ html: true });
app.use(express.static("public"));

//app.set("views", "./public");
nunjucks.configure(path.resolve(__dirname, "public", "views"), {
    autoescape: true,
    express: app,
});

const treeOptions = {
    extensions: /\.md/,
    attributes: ["type"],
    exclude: /.*\/\..*/,
};
const treeSlugger = (item, path) => {
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
    item.name_lower = noExtension.toLowerCase();
};
let menuHTML = "";
let tree = dirTree(
    process.env.VAULT_PATH,
    treeOptions,
    treeSlugger,
    treeSlugger
);
tree.children = recursivelySortTree(tree.children);
recursivelyGenerateHTMLTree(tree.children);
app.get("/*", function (req, res) {
    let contents = "";
    let metadata = {}; // data from yaml header
    if (req.url !== "/") {
        const path = recursivelyFindPath(tree.children, req.url);
        if (path !== null) {
            contents = fs.readFileSync(path, "utf8");
            // Parse the yaml front matter/header
            metadata = yamlFMatter.loadFront(contents);

            // Strip yaml header
            //contents = stripYamlHeader(contents);

            // Render markdown to html
            contents = md.render(metadata.__content);

            delete metadata.__content;
        }
    }
    const hasMetadata = Object.keys(metadata).length > 0;
    res.render("index.html", {
        tree: menuHTML,
        contents,
        metadata,
        hasMetadata,
    });
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
function recursivelyGenerateHTMLTree(children) {
    menuHTML += "<ul>";
    for (let child of children) {
        if (child.type === "directory" && child.children.length > 0) {
            menuHTML +=
                "<li><span class='osw-folder-title'><i class='fas fa-caret-right'></i>" +
                child.name +
                "</span>";
            recursivelyGenerateHTMLTree(child.children);
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

function recursivelyFindPath(children, path_slug_needle) {
    for (let child of children) {
        if (child.type === "directory" && child.children.length > 0) {
            const found = recursivelyFindPath(child.children, path_slug_needle);
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

function recursivelySortTree(children) {
    let folders = [];
    let files = [];
    for (let child of children) {
        if (child.type === "directory" && child.children.length > 0) {
            folders.push(child);
            child.children = recursivelySortTree(child.children);
        } else if (child.type === "file") {
            files.push(child);
        }
    }
    folders.sort(sortByLowerCase);
    files.sort(sortByLowerCase);
    return folders.concat(files);
}

/**
 * Sort files and folders by lower case.
 * @param {*} a
 * @param {*} b
 * @returns
 */
function sortByLowerCase(a, b) {
    if (a.name_lower < b.name_lower) return -1;
    if (a.name_lower > b.name_lower) return 1;
    return 0;
}
