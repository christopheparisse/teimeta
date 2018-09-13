; teimeta-x86.nsi
;
; This script is based on example1.nsi, but it remember the directory,
; has uninstall support and (optionally) installs start menu shortcuts.
;
; It will install teimeta.nsi into a directory that the user selects,

;--------------------------------
!include "MUI.nsh"
!include nsDialogs.nsh

;--------------------------------

; The name of the installer
Name "teimeta-install-x86"

; The file to write
OutFile "teimeta-x86.exe"

; The default installation directory
InstallDir "$PROGRAMFILES64\teimeta"

; Registry key to check for directory (so if you install again, it will
; overwrite the old one automatically)
InstallDirRegKey HKLM "Software\teimeta" "Install_Dir"

; Request application privileges for Windows Vista
RequestExecutionLevel admin

;--------------------------------

; Pages

Page components
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

;--------------------------------

; The stuff to install
Section "teimeta 64bits v0.6.5 (required)"

  SectionIn RO

  ; Put file there
  SetOutPath $INSTDIR
  File /r "c:\devlopt\teimeta\teimeta-win32-ia32\*.*"
 
  ; Write the installation path into the registry
  WriteRegStr HKLM SOFTWARE\teimeta "Install_Dir" "$INSTDIR"

  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\teimeta" "DisplayName" "teimeta"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\teimeta" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\teimeta" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\teimeta" "NoRepair" 1
  WriteUninstaller "uninstall.exe"

  CreateDirectory "$SMPROGRAMS\teimeta"
  CreateShortCut "$SMPROGRAMS\teimeta\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortCut "$SMPROGRAMS\teimeta\teimeta.lnk" "$INSTDIR\teimeta.exe"
  
SectionEnd

; Optional section (can be disabled by the user)
Section "Desktop Shortcuts"

  CreateShortCut "$DESKTOP\teimeta.lnk" "$INSTDIR\teimeta.exe"
  
SectionEnd

;--------------------------------

; Uninstaller

Section "Uninstall"

  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\teimeta"
  DeleteRegKey HKLM SOFTWARE\teimeta

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\teimeta\*.*"
  Delete "$DESKTOP\teimeta.lnk"

  ; Remove directories used
  RMDir "$SMPROGRAMS\teimeta"
  RMDir /r "$INSTDIR"

SectionEnd
