@echo off
copy ..\source ..\builds\chrome\includes
copy ..\source ..\builds\firefox\scripts
copy ..\source ..\builds\vkopt.safariextension\includes

del ..\builds\chrome\includes\build.bat
del ..\builds\firefox\scripts\build.bat
del ..\builds\vkopt.safariextension\includes\build.bat

type ..\init_src\vkinit_part1.js ..\init_src\init_list.js ..\init_src\vkinit_part2.js > ..\builds\chrome\vkinit.js
type ..\init_src\vkinit_part1.js ..\init_src\init_list.js ..\init_src\vkinit_part2.js > ..\builds\vkopt.safariextension\vkinit.js
type ..\init_src\vkldr_part1.js ..\init_src\init_list.js ..\init_src\vkldr_part2.js > ..\builds\firefox\chrome\content\vkldr.js
