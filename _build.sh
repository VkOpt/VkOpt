#! /bin/sh

DIR_CHR=builds/chrome
DIR_FFX=builds/firefox
DIR_SFR=builds/vkopt.safariextension
DIR_OPR=builds/opera.extension
DIR_FJT=builds/firefoxJetpack/resources/vkopt/data

BCGJS=background.js
CNTJS=content_script.js

cp source/* $DIR_CHR/scripts
cp source/* $DIR_FFX/scripts
cp source/* $DIR_SFR/scripts
cp source/* $DIR_OPR/scripts
cp source/* $DIR_FJT/scripts

cp $BCGJS $CNTJS $DIR_CHR
cp $BCGJS $CNTJS $DIR_FFX
cp $BCGJS $CNTJS $DIR_SFR
cp $BCGJS $CNTJS $DIR_OPR
cp $BCGJS $CNTJS $DIR_FJT
