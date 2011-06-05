@echo off
copy source builds\chrome\includes
copy source builds\firefox\scripts
copy source builds\vkopt.safariextension\includes

type init_src\vkinit_part1.js init_src\init_list.js init_src\vkinit_part2.js > builds\chrome\includes\vkinit.js
type init_src\vkinit_part1.js init_src\init_list.js init_src\vkinit_part2.js > builds\vkopt.safariextension\includes\vkinit.js
type init_src\vkldr_part1.js init_src\init_list.js init_src\vkldr_part2.js > builds\firefox\chrome\content\vkldr.js

pause