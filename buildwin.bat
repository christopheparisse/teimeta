cmd /c electron-packager temp-electron --asar=true --platform=win32 --arch=x64 --overwrite --icon=temp-electron\favicon.ico
cmd /c electron-packager temp-electron --asar=true --platform=win32 --arch=ia32 --overwrite --icon=temp-electron\favicon.ico
"C:\Program Files (x86)\NSIS\Bin\makensis.exe" teimeta-x64.nsi
"C:\Program Files (x86)\NSIS\Bin\makensis.exe" teimeta-x86.nsi