@echo off
copy ..\source ..\builds\chrome\scripts
copy ..\source ..\builds\firefox\scripts
copy ..\source ..\builds\vkopt.safariextension\scripts
copy ..\source ..\builds\opera.extension\scripts

del ..\builds\chrome\scripts\build.bat
del ..\builds\firefox\scripts\build.bat
del ..\builds\vkopt.safariextension\scripts\build.bat
del ..\builds\opera.extension\scripts\build.bat

copy ..\background.js ..\builds\chrome
copy ..\background.js ..\builds\firefox\chrome\content
copy ..\background.js ..\builds\maxthon
copy ..\background.js ..\builds\opera.extension
copy ..\background.js ..\builds\vkopt.safariextension

copy ..\content_script.js ..\builds\chrome
copy ..\content_script.js ..\builds\firefox\chrome\content
copy ..\content_script.js ..\builds\maxthon
copy ..\content_script.js ..\builds\opera.extension\includes
copy ..\content_script.js ..\builds\vkopt.safariextension

