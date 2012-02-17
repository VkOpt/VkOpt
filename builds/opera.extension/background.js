vkopt_scripts=[  
    "vklang.js",
	"vk_lib.js", 
	"vk_settings.js",
   "vk_media.js",
	"vk_users.js",
	"vk_face.js",
	"vk_page.js",
	"vk_skinman.js",
	"vk_txtedit.js",
	"vk_main.js",
	"vk_resources.js",	
    "vkopt.js"
];

function getFileContents(path){
	// Try to get the contents of the file.
	var req = new XMLHttpRequest();
	req.open('GET', path, false);
	req.send();
	// Error check for reading the file.
	if (!req.responseText) opera.postError('ERROR: Can\'t read ' + path);
	
	return req.responseText;
};

opera.extension.onconnect = function(event)  {
   for (var i=0;i<vkopt_scripts.length;i++)   event.source.postMessage(getFileContents('scripts/'+vkopt_scripts[i])); 
};