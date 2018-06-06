/* use strict */

/**
 * load a transcription from a FILE object (for internal purposes)
 * @method localLoadTranscriptFile
 * @param {file} object
 */

let saveAs = require('file-saver');
import * as alert from './alert';

export let system = 'electron';

export function openLocalFile(fun) {
    /*
    var nBytes = 0,
        oFiles = document.getElementById("upload-input-transcript").files,
        nBytes = oFiles[0].size;
    var sOutput = nBytes + " bytes";
    // optional code for multiples approximation
    for (var aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"],
        nMultiple = 0,
        nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
        sOutput = nApprox.toFixed(1) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
    }
    */
    // end of optional code
    // document.getElementById("transcript-file-size").innerHTML = sOutput;
    let d: any = document.getElementById("upload-input-transcript");
    let oFiles = d.files;
    readTranscriptObj(oFiles[0]);
};

/**
 * read a transcription from a FILE object with FileReader
 * @method readTranscriptObj
 * @param File object
 */

var readTranscriptObjCallback = null;

function readTranscriptObj(file) {
    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
        return function(e) {
            // document.getElementById('divopenfile').style.display = 'none';
            if (readTranscriptObjCallback) {
                readTranscriptObjCallback(0, file.name, e.target.result);
            }
        };
    })(file);

    // Read in the image file as a data URL.
    reader.readAsText(file);
}

/**
 * available in main
 */
export function chooseOpenFile(callback) {
    readTranscriptObjCallback = callback;
    document.getElementById('upload-input-transcript').click();
};

/**
 * @method saveFile
 * for compatibility purpose. Should not be used in a web navigator interface.
 * @param name 
 * @param data 
 */
export function saveFile(name, data) {
    saveFileLocal('xml', name, data);
}

export function chooseSaveFile(type, fun) {}

export function saveFileLocal(type, name, data) {
    var blob = new Blob([data], {
        type : "text/plain;charset=utf-8"
    });
    // {type: 'text/css'});
    var p1 = name.lastIndexOf('/');
    var p2 = name.lastIndexOf('\\');
    if (p1 < p2) p1 = p2;
    if (p1 === -1) p1 = 0;
    var l = name.substr(p1);
    saveAs.saveAs(blob, l);
};

export function openSpecificLocalFile(oddname, displayname, xmlname, xmldata, funCallback) {
    function fun(err, name, data) {
        funCallback(err, name, displayname, data, xmlname, xmldata);
    }
    alert.askUserModal(
        'The file <b>' + xmlname + '</b> uses an Odd file named <b>' + oddname +
        '</b> - please locate it on you computer.',
        function(response) { if (response) chooseOpenFile(fun) }
    );    
}
