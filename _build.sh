cp source/* builds/chrome/scripts
cp source/* builds/firefox/scripts
cp source/* builds/vkopt.safariextension/scripts
cp source/* builds/opera.extension/scripts
cp source/* builds/firefoxJetpack/resources/vkopt/data/scripts

cp background.js builds/chrome/background.js
cp background.js builds/firefox/resources/vkopt/lib/background.js
cp background.js builds/maxthon/background.js
cp background.js builds/opera.extension/background.js
cp background.js builds/vkopt.safariextension/background.js
cp background.js builds/firefoxJetpack/resources/vkopt/data/background.js

cp content_script.js builds/chrome/content_script.js
cp content_script.js builds/firefox/resources/vkopt/data/content_script.js
cp content_script.js builds/maxthon/content_script.js
cp content_script.js builds/opera.extension/includes/content_script.js
cp content_script.js builds/vkopt.safariextension/content_script.js
cp content_script.js builds/firefoxJetpack/resources/vkopt/data/content_script.js
