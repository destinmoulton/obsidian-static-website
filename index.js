require("dotenv").config();
const glob = require("glob");

(async () => {
    const longpath = process.env.VAULT_PATH + "/**/*.md";
    glob(longpath, {}, function (err, files) {
        if (err) throw err;

        console.log(files);
    });
})();
