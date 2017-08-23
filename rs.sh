rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/"  --exclude="temp-page/"  --exclude="temp-electron/" --exclude="teimeta-win32*/" --exclude="teimeta-*darwin*/"  --exclude="dist/" ../../../devlopt/teimeta/* .

