@echo off
copy ..\source ..\builds\chrome\includes
copy ..\source ..\builds\firefox\scripts
copy ..\source ..\builds\vkopt.safariextension\includes
copy ..\source ..\builds\opera.extension\scripts

del ..\builds\chrome\includes\build.bat
del ..\builds\firefox\scripts\build.bat
del ..\builds\vkopt.safariextension\includes\build.bat
del ..\builds\opera.extension\scripts\build.bat

type ..\init_src\vkinit_part1.js ..\init_src\init_list.js ..\init_src\vkinit_part2.js > ..\builds\chrome\vkinit.js
type ..\init_src\vkinit_part1.js ..\init_src\init_list.js ..\init_src\vkinit_part2.js > ..\builds\vkopt.safariextension\vkinit.js
type ..\init_src\vkldr_part1.js ..\init_src\init_list.js ..\init_src\vkldr_part2.js > ..\builds\firefox\chrome\content\vkldr.js
type ..\init_src\ldr_opera_ext_1.js ..\init_src\init_list.js ..\init_src\ldr_opera_ext_2.js > ..\builds\opera.extension\background.js