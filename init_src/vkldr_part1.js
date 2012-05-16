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
     Js2Doc(doc, 