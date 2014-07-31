cd ..
cp source/* builds/chrome/scripts
cp source/* builds/firefox/scripts
cp source/* builds/vkopt.safariextension/scripts
cp source/* builds/opera.extension/scripts

rm builds/chrome/scripts/build.bat
rm builds/firefox/scripts/build.bat
rm builds/vkopt.safariextension/scripts/build.bat
rm builds/opera.extension/scripts/build.bat

rm builds/chrome/scripts/build.sh
rm builds/firefox/scripts/build.sh
rm builds/vkopt.safariextension/scripts/build.sh
rm builds/opera.extension/scripts/build.sh

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

