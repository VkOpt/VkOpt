#!/bin/bash

filename="vkopt_firefox.xpi"
rm $filename
cd firefox
zip ../$filename * -r -9
