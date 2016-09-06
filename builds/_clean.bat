@IF [%1] == [] ECHO OFF
echo Cleaning

if %11 == 1%1 del /Q chrome\background.js
if %11 == 1%1 del /Q chrome\content_script.js
if %12 == 2%1 del /Q firefox\resources\vkopt\data\content_script.js
if %12 == 2%1 del /Q firefox\resources\vkopt\lib\background.js
if %13 == 3%1 del /Q opera.extension\background.js
if %13 == 3%1 del /Q opera.extension\includes\content_script.js
if %14 == 4%1 del /Q vkopt.safariextension\background.js
if %14 == 4%1 del /Q vkopt.safariextension\content_script.js
if %15 == 5%1 del /Q firefoxJetpack\resources\vkopt\data\background.js
if %15 == 5%1 del /Q firefoxJetpack\resources\vkopt\data\content_script.js
if %16 == 6%1 del /Q maxthon\background.js
if %16 == 6%1 del /Q maxthon\content_script.js
if %17 == 7%1 del /Q edge\background.js
if %17 == 7%1 del /Q edge\content_script.js

if %11 == 1%1 del /Q chrome\scripts\vk*
if %12 == 2%1 del /Q firefox\scripts\vk*
if %13 == 3%1 del /Q opera.extension\scripts\vk*
if %14 == 4%1 del /Q vkopt.safariextension\scripts\vk*
if %15 == 5%1 del /Q firefoxJetpack\resources\vkopt\data\scripts\vk*
if %17 == 7%1 del /Q edge\scripts\vk*

del /Q vkopt_chrome.zip vkopt_firefox_jetpack.xpi vkopt_firefox.xpi vkopt_firefox_webext.xpi vkopt_opera.oex vkopt_maxthon.mxaddon

echo Done.
