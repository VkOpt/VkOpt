// ==UserScript==
// @include       *vkontakte.ru*
// @include       *vk.com*
// @include       *vkadre.ru*
// @include       *durov.ru*
// ==/UserScript==

opera.extension.onmessage = function(event){
	var data = event.data;
   if (data.indexOf('vkontakte')!=-1)  window.eval(data);
};

