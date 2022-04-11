/**
 * Functionality for Obsidian Website.
 *
 * @author Destin Moulton
 * @license MIT
 */
(function () {
    document.addEventListener("DOMContentLoaded", function () {
        setupFolderListeners();
    });

    function setupFolderListeners() {
        const folders = document.querySelectorAll(".osw-folder-title");
        for (let folder of folders) {
            folder.addEventListener("click", function (evt) {
                const $ul = evt.currentTarget.nextElementSibling;
                const isActive = $ul.classList.contains("osw-folder-active");

                if (!isActive) {
                    $ul.classList.add("osw-folder-active");
                }
                console.log("clicked title");
            });
        }
    }
})();
