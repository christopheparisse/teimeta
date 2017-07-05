rsync -auv temp-page/css parisse@ct3.ortolang.fr:/applis/teimeta
rsync -uv temp-page/teimeta.html parisse@ct3.ortolang.fr:/applis/teimeta/index.html
rsync -uv temp-page/bundle.js parisse@ct3.ortolang.fr:/applis/teimeta
rsync -uv temp-page/favicon.ico parisse@ct3.ortolang.fr:/applis/teimeta
rsync -uv readme.html parisse@ct3.ortolang.fr:/applis/teimeta
rsync -uv models/*odd parisse@ct3.ortolang.fr:/applis/teimeta
rsync -uv teimeta.zip parisse@ct3.ortolang.fr:/applis/teimeta
