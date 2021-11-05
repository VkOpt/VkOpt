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


def zipdir(dirPath=None, zipFilePath=None, includeDirInZip=True, regEx=None, exclude_regex=None):

    if not zipFilePath:
        zipFilePath = dirPath + ".zip"
    if not os.path.isdir(dirPath):
        raise OSError("dirPath argument must point to a directory. "
            "'%s' does not." % dirPath)
    parentDir, dirToZip = os.path.split(dirPath)
    #Little nested function to prepare the proper archive path
    def trimPath(path):
        archivePath = path.replace(parentDir, "", 1)
        if parentDir:
            archivePath = archivePath.replace(os.path.sep, "", 1)
        if not includeDirInZip:
            archivePath = archivePath.replace(dirToZip + os.path.sep, "", 1)
        return os.path.normcase(archivePath)

    if os.path.isfile(zipFilePath):
      print('Remove %s' % zipFilePath)
      os.remove(zipFilePath)
    print('Packing to %s' % zipFilePath)

    outFile = zipfile.ZipFile(zipFilePath, "w",
        compression=zipfile.ZIP_DEFLATED)
    for (archiveDirPath, dirNames, fileNames) in os.walk(dirPath):
        if archiveDirPath.find('\\.') != -1:
            print("\tExcluded: "+archiveDirPath)
            continue
        print("\tPacking dir: "+archiveDirPath)
        for fileName in fileNames:
            if regEx and not re.match(regEx, fileName):
               print("\tExcluded by regex: "+fileName)
               continue
            if exclude_regex and re.match(exclude_regex, fileName):
               print("\tExcluded by exclude_regex: "+fileName)
               continue
            #if fileName[-1] == '~' or (fileName[0] == '.' and fileName != '.htaccess'):
                #skip backup files and all hidden files except .htaccess
                #continue
            filePath = os.path.join(archiveDirPath, fileName)
            outFile.write(filePath, trimPath(filePath))
        #Make sure we get empty directories as well
        if not fileNames and not dirNames:
            zipInfo = zipfile.ZipInfo(trimPath(archiveDirPath) + "/")
            #some web sites suggest doing
            #zipInfo.external_attr = 16
            #or
            #zipInfo.external_attr = 48
            #Here to allow for inserting an empty directory.  Still TBD/TODO.
            outFile.writestr(zipInfo, "")
    outFile.close()

def SetFirefoxVersion(file_name, new_version):
   print('Load install.RDF:\t\t'+file_name);
   with open(file_name, 'r', encoding='utf-8-sig') as infile:
      data = infile.read()
      data = re.sub(r'(<em:version>)[\d\.]+(</em:version>)', '\g<1>%s\g<2>' % new_version, data)
      infile.close()
   with open(file_name, 'w', encoding='utf-8') as outfile:
      outfile.write(data)
      outfile.close()


def SetJsonVersion(file_name, new_version):
   print('Load *.JSON :\t\t'+file_name);
   with open(file_name, 'r', encoding='utf-8-sig') as infile:  #
      data = infile.read()
      data = re.sub(r'("version"\s*:\s*)"[\d\.]+"', '\g<1>"%s"' % new_version, data)
      infile.close()
   with open(file_name, 'w', encoding='utf-8') as outfile:
      outfile.write(data)
      outfile.close()

def SetSafariVersion(file_name, new_version):
   print('Load info.plist :\t\t'+file_name);
   with open(file_name, 'r', encoding='utf-8-sig') as infile:  #
      data = infile.read()
      data = re.sub(r'(<key>(?:CFBundleShortVersionString|CFBundleVersion)</key>[\s\r\n]+?<string>)(?:[\d\.]+?)(</string>)', '\g<1>%s\g<2>' % new_version, data)
      infile.close()
   with open(file_name, 'w', encoding='utf-8') as outfile:
      outfile.write(data)
      outfile.close()

def SetOperaVersion(file_name, new_version):
   print('Load config.XML:\t\t'+file_name);
   with open(file_name, 'r', encoding='utf-8-sig') as infile:  #
      data = infile.read()
      data = re.sub(r'(<widget[^<>]*?\sversion\s*=\s*)"[\d\.]+"', '\g<1>"%s"' % new_version, data)
      infile.close()
   with open(file_name, 'w', encoding='utf-8') as outfile:
      outfile.write(data)
      outfile.close()

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

def MxAddonPack(indir, outfile):
   mxaddon = createMxPak1(indir)
   with open(outfile, 'wb') as f:
      f.write(mxaddon)
      f.close()
   print("MxPack: Written %d bytes to %s" % (len(mxaddon), outfile))


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




# парсим номер версии из скрипта
version = GetScriptsVersion('chrome\\scripts\\vkopt.js')

new_ver =  '%s.%s' % (version["ver"], version["rev"])
new_ver_ff =  version["buildver"]
full_ver = 'v%s_(%s)' % (version["ver"], version["build"])

# вшиваем номер версии в манифесты
SetJsonVersion('chrome\\manifest.json', new_ver);
SetJsonVersion('webext\\manifest.json', new_ver);
SetFirefoxVersion('firefoxJetpack\\install.rdf', new_ver)
SetFirefoxVersion('firefox\\install.rdf', new_ver_ff)
SetJsonVersion('maxthon\\def.json', new_ver)
SetOperaVersion('opera.extension\\config.xml', new_ver)
SetSafariVersion('vkopt.safariextension\\Info.plist', new_ver)

regex = None
exclude_regex = "\.(orig|gitignore)$"

zipdir("firefox", "vkopt_%s_firefox.xpi" % full_ver, False,regex,exclude_regex)
zipdir("firefox", "vkopt_%s_palemoon.xpi" % full_ver, False,regex,exclude_regex)
zipdir("opera.extension", "vkopt_%s_opera.oex" % full_ver, False,regex,exclude_regex)
zipdir("chrome", "vkopt_%s_chrome.zip" % full_ver, False,regex,exclude_regex)
zipdir("webext", "vkopt_%s_firefox.webext.xpi" % full_ver, False,regex,exclude_regex)
MxAddonPack('maxthon/','vkopt_%s_maxthon.mxaddon' % full_ver)
zipdir('../source/', 'vkopt_%s_opera.zip' % full_ver, False, "^vk(_|opt|lang).*\.(js|txt)$", exclude_regex)
MakeUserJS(new_ver, '../source/','vkopt_%s_script.user.js' % full_ver)

with open('vkopt_%s_!onserver.txt' % full_ver, 'w') as f:
   f.write(u'need update on server "config.json" and "scripts"')
   f.close()


