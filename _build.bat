@echo off
copy source builds\chrome\scripts\
copy source builds\firefox\scripts\
copy source builds\vkopt.safariextension\scripts\
copy source builds\opera.extension\scripts\
copy source builds\firefoxJetpack\resources\vkopt\data\scripts\

for %%I in (background.js content_script.js LICENSE) do (
	copy %%I builds\chrome\
	copy %%I builds\firefox\chrome\content\
	copy %%I builds\maxthon\
	copy %%I builds\opera.extension\
	copy %%I builds\vkopt.safariextension\
	copy %%I builds\firefoxJetpack\resources\vkopt\data\
)
