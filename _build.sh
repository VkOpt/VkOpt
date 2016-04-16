#! /bin/sh

BCGJS=background.js
CNTJS=content_script.js


# Chrome
DIR_CHR=builds/chrome
cp $BCGJS $CNTJS $DIR_CHR
cp source/* $DIR_CHR/scripts

# Firefox
DIR_FFX=builds/firefox
cp $BCGJS $DIR_FFX/resources/vkopt/lib
cp $CNTJS $DIR_FFX/resources/vkopt/data
cp source/* $DIR_FFX/scripts

# Firefox (jetpack)
DIR_FJT=builds/firefoxJetpack/resources/vkopt/data
cp $BCGJS $CNTJS $DIR_FJT
cp source/* $DIR_FJT/scripts

# Safari
DIR_SFR=builds/vkopt.safariextension
cp $BCGJS $CNTJS $DIR_SFR
cp source/* $DIR_SFR/scripts

# Opera
DIR_OPR=builds/opera.extension
cp $BCGJS $DIR_OPR
cp $CNTJS $DIR_OPR/includes
cp source/* $DIR_OPR/scripts

# Maxthon
DIR_MXT=builds/maxthon
cp $BCGJS $CNTJS $DIR_MXT
