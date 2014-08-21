cd ..
cp source/* builds/chrome/scripts
cp source/* builds/firefox/scripts
cp source/* builds/vkopt.safariextension/scripts
cp source/* builds/opera.extension/scripts

cp background.js builds/chrome/background.js
cp background.js builds/firefox/chrome/content/background.js
cp background.js builds/maxthon/background.js
cp background.js builds/opera.extension/background.js
cp background.js builds/vkopt.safariextension/background.js

cp content_script.js builds/chrome/content_script.js
cp content_script.js builds/firefox/chrome/content/content_script.js
cp content_script.js builds/maxthon/content_script.js
cp content_script.js builds/opera.extension/includes/content_script.js
cp content_script.js builds/vkopt.safariextension/content_script.js

