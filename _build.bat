@echo off

cd source
for %%i in (*.js) do java -jar ..\compiler.jar --accept_const_keyword --compilation_level SIMPLE --js_output_file=..\builds\firefox\scripts\%%i %%i
cd ..

copy builds\firefox\scripts builds\chrome\scripts
copy builds\firefox\scripts builds\vkopt.safariextension\scripts
copy builds\firefox\scripts builds\opera.extension\scripts

copy background.js builds\chrome
copy background.js builds\firefox\chrome\content
copy background.js builds\maxthon
copy background.js builds\opera.extension
copy background.js builds\vkopt.safariextension

copy content_script.js builds\chrome
copy content_script.js builds\firefox\chrome\content
copy content_script.js builds\maxthon
copy content_script.js builds\opera.extension\includes
copy content_script.js builds\vkopt.safariextension
