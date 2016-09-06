@IF [%1] == [] ECHO OFF

call _clean.bat %1

echo Copying
echo scripts
if [%11] == [1%1] copy ..\source chrome\scripts\
if [%12] == [2%1] copy ..\source firefox\scripts\
if [%13] == [3%1] copy ..\source opera.extension\scripts\
if [%14] == [4%1] copy ..\source vkopt.safariextension\scripts\
if [%15] == [5%1] copy ..\source firefoxJetpack\resources\vkopt\data\scripts\
if [%17] == [7%1] copy ..\source edge\scripts\

echo background.js
if [%11] == [1%1] copy ..\background.js chrome\
if [%12] == [2%1] copy ..\background.js firefox\resources\vkopt\lib\
if [%13] == [3%1] copy ..\background.js opera.extension\
if [%14] == [4%1] copy ..\background.js vkopt.safariextension\
if [%15] == [5%1] copy ..\background.js firefoxJetpack\resources\vkopt\data\
if [%16] == [6%1] copy ..\background.js maxthon\
if [%17] == [7%1] copy ..\background.js edge\

echo content_script.js
if [%11] == [1%1] copy ..\content_script.js chrome\
if [%12] == [2%1] copy ..\content_script.js firefox\resources\vkopt\data\
if [%13] == [3%1] copy ..\content_script.js opera.extension\includes\
if [%14] == [4%1] copy ..\content_script.js vkopt.safariextension\
if [%15] == [5%1] copy ..\content_script.js firefoxJetpack\resources\vkopt\data\
if [%16] == [6%1] copy ..\content_script.js maxthon\
if [%17] == [7%1] copy ..\content_script.js edge\

echo Done.
