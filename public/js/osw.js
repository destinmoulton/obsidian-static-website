/**
 * Functionality for Obsidian Website.
 *
 * @author Destin Moulton
 * @license MIT
 */
(function () {
    document.addEventListener("DOMContentLoaded", function () {
        setupTreeFolderListeners();
    });

    /**
     * Setup the folder tree listeners.
     *  - Toggle the icons on click
     *  - Toggle visibility of the subtree
     */
    function setupTreeFolderListeners() {
        const folders = document.querySelectorAll(".osw-folder-title");
        for (let folder of folders) {
            folder.addEventListener("click", function (evt) {
                const $title = evt.currentTarget;
                const $ul = $title.nextElementSibling;
                const isActive = $ul.classList.contains("osw-folder-active");
                const $i = $title.querySelector("i");
                if (!isActive) {
                    $ul.classList.add("osw-folder-active");
                    $i.classList.remove("fa-caret-right");
                    $i.classList.add("fa-caret-down");
                } else {
                    $ul.classList.remove("osw-folder-active");
                    $i.classList.add("fa-caret-right");
                    $i.classList.remove("fa-caret-down");
                }
            });
        }
    }
})();
