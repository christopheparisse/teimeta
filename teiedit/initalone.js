function bodyKeys(e) {
    /*
    console.log('keyCode '+ e.keyCode);
    console.log('charCode '+ e.charCode);
    console.log('ctrl '+ e.ctrlKey);
    console.log('alt '+ e.altKey);
    console.log('shift '+ e.shiftKey);
    console.log('meta '+ e.metaKey);
    console.log('ident ' + e.keyIdentifier);
    */
/*    if (e.which === 117 && e.altKey !== true && e.ctrlKey !== true) {
        e.preventDefault();
        teiEdit.insertLineAtEnd(e);
    }
*/  
    if (e.which === 79 && e.ctrlKey === true) { // ctrl O
        teiEdit.open();
    }
    if (e.which === 79 && e.ctrlKey === true && e.shiftKey === true) { // ctrl shift O
        teiEdit.openOdd();
    }
    if (e.which === 83 && e.ctrlKey === true) { // ctrl S
        teiEdit.save();
    }
    if (e.which === 83 && e.ctrlKey === true && e.shiftKey === true) { // ctrl shift S
        teiEdit.saveas();
    }
    if (e.which === 78 && e.ctrlKey === true) { // ctrl N
        teiEdit.new();
    }
}

teiEdit.init = function() {
    // load previous data
    try {
        if (localStorage.previousData) {
            var js = JSON.parse(localStorage.previousData);
            teiEdit.loadTableData(js);
            teiEdit.datatable.fileName = js.datatable.fileName;
            $('#filename').html("Fichier: " + teiEdit.datatable.fileName);
       } else
        teiEdit.new();
    } catch (error) {
        teiEdit.new();
    }
    $('body').click(bodyKeys);
}