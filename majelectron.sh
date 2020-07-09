cd TeiMeta-darwin-x64
#zip -r ../teimeta-macos.zip teimeta.app
ditto -ck --rsrc --sequesterRsrc --keepParent teimeta.app ../teimeta-macos.zip
cd ..
scp teimeta-macos.zip parisse@ct3.ortolang.fr:/applis/download/
