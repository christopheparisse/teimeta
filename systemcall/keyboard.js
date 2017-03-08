
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
*/  if (e.which === 79 && e.ctrlKey === true) { // ctrl O
        teiEdit.open();
    }
    if (e.which === 83 && e.ctrlKey === true) { // ctrl S
        teiEdit.save();
    }
    if (e.which === 83 && e.ctrlKey === true && e.shiftKey === true) { // ctrl S
        teiEdit.saveas();
    }
    if (e.which === 84 && e.ctrlKey === true) { // ctrl T
        teiEdit.savecsv();
    }
    if (e.which === 77 && e.ctrlKey === true && e.shiftKey === true) { // ctrl+shift+O
        teiEdit.openmodel();
    }
    if (e.which === 78 && e.ctrlKey === true) { // ctrl N
        teiEdit.clearTableData();
    }
}
