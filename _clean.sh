find ./builds/ -name background.js -delete
find ./builds/ -name content_script.js -delete

rm builds/chrome/scripts/vk*
rm builds/firefox/scripts/vk*
rm builds/firefoxJetpack/resources/vkopt/data/scripts/vk*
rm builds/vkopt.safariextension/scripts/vk*
rm builds/opera.extension/scripts/vk*

rm builds/vkopt_chrome.zip builds/vkopt_firefox_jetpack.xpi builds/vkopt_firefox.xpi builds/vkopt_opera.oex
