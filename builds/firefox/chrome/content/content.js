function InjectScripts(e){
     if (isVKDomain(e.originalTarget.domain))
      VkLoadScripts(e.originalTarget);

}
function Js2Doc(doc){
  for (var i=1;i<arguments.length;i++){  
    var js = doc.createElement('script');
    js.type = 'text/javascript';
    js.src =  'resource://vkopt/'+arguments[i];
    doc.getElementsByTagName('head')[0].appendChild(js);
  }
}

function VkLoadScripts(doc){
     Js2Doc(doc,     "vklang.js",
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
    "vkopt.js"       );
}
function isVKDomain(domain){
   return (domain.match(/vk\.com|vkontakte\.ru|userapi\.com|vk\.me|youtube\.com|vimeo\.com/));
}

addEventListener("DOMContentLoaded", InjectScripts, true); 
