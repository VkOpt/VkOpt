function insertScript(filename) {
    var elem = document.createElement('script');
    elem.src = "resource://vkopt-at-vkopt-dot-net/vkopt/data/scripts/" + filename;
    document.head.appendChild(elem);
}

var files = [
    "vkopt.js",
    "vk_face.js",
    "vk_lib.js",
    "vk_main.js",
    "vk_media.js",
    "vk_page.js",
    "vk_resources.js",
    "vk_settings.js",
    "vk_skinman.js",
    "vk_txtedit.js",
    "vk_users.js",
    "vklang.js"
];

for (var i in files)
    insertScript(files[i]);


