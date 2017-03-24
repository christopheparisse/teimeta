/**
 * @name initelectron.js
 * @author Christophe Parisse
 */

const ipcRenderer = require('electron').ipcRenderer;
import * as events from './events';
export function init() {
    // load previous data
    try {
        if (localStorage.previousData) {
            var js = JSON.parse(localStorage.previousData);
            events.loadTableData(js);
            events.datatable.fileName = js.datatable.fileName;
            $('#filename').html("Fichier: " + events.datatable.fileName);
       } else
        events.new();
    } catch (error) {
        events.new();
    }
    /*
        $('body').keydown(bodyKeys);
    */
    ipcRenderer.on('clear', function(event, arg) {
        events.newFile();
    });
    ipcRenderer.on('open', function(event, arg) {
        events.open();
    });
    ipcRenderer.on('openodd', function(event, arg) {
        events.openOdd();
    });
    ipcRenderer.on('save', function(event, arg) {
        events.save();
    });
    ipcRenderer.on('saveas', function(event, arg) {
        events.saveAs();
    });
    ipcRenderer.on('test', function(event, arg) {
        events.test();
    });
};
