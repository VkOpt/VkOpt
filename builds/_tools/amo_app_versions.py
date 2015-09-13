#!/usr/bin/python
import os
import sys
import urllib2
import re
import json
from xml.dom import minidom

APP_VERSIONS_URL = 'https://addons.mozilla.org/en-US/firefox/pages/appversions/'

def loadAppVerions():
   app_versions = []
   response = urllib2.urlopen(APP_VERSIONS_URL)
   html = response.read()
   rx = re.compile(r"<h3[\s\S]+?<img[^>]+>[\s\r\n]+([^<>\r\n]+)[\s\S]+?<code>(.+?)<\/code>[\s\S]+?Versions[\s\S]+?<code>(.+?,\s*([a-z\d\.\*]+))<\/code>", re.IGNORECASE)
   print('              GUID                    \tVer\tName')
   for m in re.finditer(rx, html):
      app_versions.append({"name":m.group(1), "GUID":m.group(2), "last_ver":m.group(4), "versions":re.split(r"\s*,\s*",m.group(3))})
      print(m.group(2)+'\t'+m.group(4)+'\t'+m.group(1))

   return app_versions

def SaveAppVerionsToFile(file_name='amo_app_versions.json'):
   app_versions_text = json.dumps(loadAppVerions(), sort_keys=True,
                    indent=3, separators=(',', ': '))                 
   f = open(file_name,'w')
   f.write(app_versions_text)
   f.close()


def UpdateManifestMaxVerions(file_name):
   print('Load manifest:\t\t'+file_name);
   xmldoc = minidom.parse(file_name)
   itemlist = xmldoc.getElementsByTagName('em:targetApplication');
   print('Load app last versions info');
   app_versions = loadAppVerions()
   print('Compare versions...');
   for item in itemlist:
      guid = item.getElementsByTagName('em:id')[0].firstChild.nodeValue
      maxver = item.getElementsByTagName('em:maxVersion')[0].firstChild
      
      for app in app_versions:
         if app['GUID'] == guid:
            print(app['name']+':')
            if maxver.nodeValue == app["last_ver"]:
               print '  ok'
            else:
               print('  last appVersion\t\t: '+app["last_ver"])
               print('  manifest maxVersion\t\t: '+maxver.nodeValue)
               print('  changing maxVersion in manifest... ')
               maxver.nodeValue = app["last_ver"];
   
   f = open(file_name,'w')
   f.write(xmldoc.toxml('utf-8'))
   f.close()


def main():
   if len(sys.argv)>1:
      arg0,input = sys.argv
   else:
      arg0 = sys.argv
   UpdateManifestMaxVerions(input)
   
if __name__ == "__main__":   
   main()