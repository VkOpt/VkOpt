#!/usr/bin/env python
import os
import sys
import re
import zipfile
import codecs
from io import open
from array import *
from subprocess import *

sys.path.append('_tools/')
from mxpack import *

def GetScriptsVersion(file_name):
   print('Load:\t\t'+file_name);
   with open(file_name, 'r', encoding='utf-8') as infile:  #
      data = infile.read()#.decode('utf-8-sig')
      infile.close()
      build = re.search("var\s*vBuild\s*=\s*(\d+)", data).group(1)
      m_ver = re.search("var\s*vVersion\s*=\s*(\d+)", data).group(1)
      rev = re.search("var\s*vVersionRev\s*=\s*(\d+)", data).group(1)
      ver = '%s.%s.%s' % (m_ver[0], m_ver[1], m_ver[2])
      print(ver+' ['+build+']')
   return {"build":build, "ver": ver, "rev": rev, "buildver": '%s.%s' % (ver, build)}

def MakeUserJS(ver, dirPath=None, ujsFilePath=None):
    if not ujsFilePath:
        ujsFilePath = dirPath + ".user.js"
    ujsFilePath2 =  os.path.join(os.path.dirname(os.path.abspath(ujsFilePath)),'vkopt_script.user.js');
    metajsFilePath =  os.path.join(os.path.dirname(os.path.abspath(ujsFilePath)),'vkopt_script.meta.js');
    if not os.path.isdir(dirPath):
        raise OSError("dirPath argument must point to a directory. "
            "'%s' does not." % dirPath)

    if os.path.isfile(ujsFilePath):
      print('Remove %s' % ujsFilePath)
      os.remove(ujsFilePath)
    print('Concatenating files to %s' % ujsFilePath)

    tpl = ""
    script_content = ""
    meta_content = ""
    meta = True
    filePath = os.path.join(dirPath, '../script.user.js');
    inFile = open(filePath, 'r', encoding='utf-8-sig')
    for line in inFile:
        if line.find('{script_version}') > -1:
            line = line.format(script_version=ver)
        tpl += line

        if meta:
            meta_content += line;
        if line.find('// ==/UserScript==') > -1:
            meta = False

    tpl = tpl.split('{script_content}');

    fileNames = ['vkopt.js', 'vk_lib.js', 'vklang.js']

    for fileName in fileNames:
        print("Read '%s' content" % fileName)
        filePath = os.path.join(dirPath, fileName)
        inFile = open(filePath, 'r', encoding='utf-8-sig')
        for line in inFile:
            script_content += line
        inFile.close()

    outputFiles = [ujsFilePath, ujsFilePath2]
    for fileName in outputFiles:
        print("Write output to '%s'" % os.path.basename(fileName))
        outFile = open(fileName, 'w', encoding='utf-8-sig')
        outFile.write(tpl[0])
        outFile.write(script_content)
        outFile.write(tpl[1])
        outFile.close()

    print("Write output meta to '%s'" % os.path.basename(metajsFilePath))
    outFile = open(metajsFilePath, 'w', encoding='utf-8-sig')
    outFile.write(meta_content)
    outFile.close()
    
version = GetScriptsVersion('chrome\\scripts\\vkopt.js')
new_ver =  '%s.%s' % (version["ver"], version["rev"])
new_ver_ff =  version["buildver"]
full_ver = 'v%s_(%s)' % (version["ver"], version["build"])
regex = None
exclude_regex = "\.(orig|gitignore)$"
MakeUserJS(new_ver, '../source/','vkopt_%s_script.user.js' % full_ver)