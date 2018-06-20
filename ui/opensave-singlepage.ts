/* use strict */

/**
 * load a transcription from a FILE object (for internal purposes)
 * @method localLoadTranscriptFile
 * @param {file} object
 */

import * as common from './common';

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
    common.saveFileLocal('xml', name, data);
}

export function chooseSaveFile(type, fun) {}
