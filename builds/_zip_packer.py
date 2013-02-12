#!/usr/bin/python
import os
import zipfile
import sys
import re
from array import *
from subprocess import *

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

    outFile = zipfile.ZipFile(zipFilePath, "w",
        compression=zipfile.ZIP_DEFLATED)
    for (archiveDirPath, dirNames, fileNames) in os.walk(dirPath):
        if archiveDirPath.find('\\.') != -1:
            print("Excluded: "+archiveDirPath)
            continue 
        print("Packing dir: "+archiveDirPath)
        for fileName in fileNames:
            if regEx and not re.match(regEx, fileName):
               print("Excluded by regex: "+fileName)
               continue
            if exclude_regex and re.match(exclude_regex, fileName):
               print("Excluded by exclude_regex: "+fileName)
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
    
def main():
    regex=None
    exclude_regex=None     
    if len(sys.argv)>4:
      arg0,input,output,regex,exclude_regex = sys.argv
    else:
      arg0,input,output = sys.argv
      
    filename = output
    directory = input
    zipdir(directory, filename, False,regex,exclude_regex)
    print("Packed: "+filename);


main()