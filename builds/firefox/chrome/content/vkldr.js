function VkOpt_Loader(){
        var appcontent = document.getElementById("content");
		if(appcontent){
          appcontent.addEventListener("DOMContentLoaded",  function(e){
              if (isVKDomain(e.originalTarget.domain))
               VkLoadScripts(e.originalTarget);
          }, true);
        }
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
     Js2Doc(doc, 
    "vklang.js",
	"vk_lib.js", 
	"vk_settings.js",
	"vk_users.js",
	"vk_face.js",
	"vk_page.js",
	"vk_skinman.js",
	"vk_txtedit.js",
	"vk_main.js",
	"vk_resources.js",	
    "vkopt.js"
       );
}
function isVKDomain(domain){return (domain.match('vkontakte.ru') || domain.match('vk.com') || domain.match('youtube.com'));}
window.addEventListener('load',VkOpt_Loader, false);