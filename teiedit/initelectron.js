/* global teiEdit */

const ipcRenderer = require('electron').ipcRenderer;

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
    /*
        $('body').keydown(bodyKeys);
    */
    ipcRenderer.on('clear', function(event, arg) {
        teiEdit.new();
    });
    ipcRenderer.on('open', function(event, arg) {
        teiEdit.open();
    });
    ipcRenderer.on('openodd', function(event, arg) {
        teiEdit.openOdd();
    });
    ipcRenderer.on('save', function(event, arg) {
        teiEdit.save();
    });
    ipcRenderer.on('saveas', function(event, arg) {
        teiEdit.saveAs();
    });
    ipcRenderer.on('test', function(event, arg) {
        teiEdit.test();
    });
};
