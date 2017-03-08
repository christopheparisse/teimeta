/* global teiEdit */
/* global TableData */
/* global $ */

teiEdit.tableElementKeys = function(e) {
    /*
    console.log('keyCode '+ e.keyCode);
    console.log('charCode '+ e.charCode);
    console.log('ctrl '+ e.ctrlKey);
    console.log('alt '+ e.altKey);
    console.log('shift '+ e.shiftKey);
    console.log('meta '+ e.metaKey);
    console.log('ident ' + e.keyIdentifier);
    */
    if (e.which === 117 && e.shiftKey !== true) {
        e.preventDefault();
        teiEdit.insertLine(e);
    }
    if (e.which === 117 && e.shiftKey === true) {
        e.preventDefault();
        teiEdit.deleteLine(e);
    }
};

teiEdit.test = function() {
    systemCall.openFile('/Users/christopheparisse/ownCloud/tei-lyon/TEI_Meta_0/ODD_Meta_niveau0_V7.odd', function(err, name, data) {
        if (!err) {
            $('#oddname').html("Odd: " + name);
            var ed = teiMeta.loadOdd(data);
            $('#odddata').html(ed);
        } else
            console.log(name, err);
    });
};

teiEdit.open = function() {    
    systemCall.chooseOpenFile(function(err, name, data) {
        if (!err) {
            teiEdit.datatable.fileName = name;
            $('#filename').html("Fichier: " + name);
            var ed = teiMeta.loadTei(data);
            $('#teidata').html(ed);
        } else
            console.log(name, err);
    });
};

teiEdit.openOdd = function() {    
    systemCall.chooseOpenFile(function(err, name, data) {
        if (!err) {
            $('#oddname').html("Odd: " + name);
            var ed = teiMeta.loadOdd(data);
            $('#odddata').html(ed);
        } else
            console.log(name, err);
    });
};

teiEdit.new = function() {
    var dt = $('#teidata');
    dt.html('<p>TEI DATA</p>');
    teiData.fileName = 'Nouveau fichier';
    $('#filename').html("Fichier: " + name);
}

teiEdit.newWithOdd = function() {
    teiEdit.openOdd();
    teiEdit.new();
    $('#filename').html("Fichier: " + "new file");
};

teiEdit.saveAs = function() {    
    systemCall.chooseSaveFile('json', function(err, name) {
        if (!err) {
            teiEdit.datatable.fileName = name;
            $('#filename').html("Fichier: " + teiEdit.datatable.fileName);
            var ed = teiMeta.unloadTei();
            systemCall.saveFile(name, ed);
        } else
            console.log(name, err);
    });
};

teiEdit.save = function() {
    var fileok = true;
    if (!teiEdit.datatable.fileName) {
            var ed = teiEdit.unloadTeiData();
            systemCall.saveFile(teiEdit.datatable.fileName, ed);
    } else
        teiEdit.saveAs();
};

teiEdit.saveAsLocal = function() {
    var ed = teiEdit.unloadTeiData();
    systemCall.saveFileLocal('xml', teiEdit.datatable.fileName, ed);
};
