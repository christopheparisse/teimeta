/**
 * alert.ts
 * display functions
 */

/* use strict */

let saveAs = require('file-saver');
let picoModal = require('picomodal');
import * as msg from './messages';

export function alertUser(s) {
    picoModal(s).show();
    //    dialog.showErrorBox('teiEdit', s);
}

export function alertUserModal(s, fun: any) {
    picoModal(s).afterClose(() => fun()).show();
}

export function promptUserModal(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p><input name='picomodalprompt' id='picomodalprompt'></input></p>" +
            "<p class='footer'>" +
            "<button class='cancel'>Cancel</button> " +
            "<button class='ok'>Ok</button>" +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".ok")) {
                modal.close(true);
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close(false);
            }
        });
        modal.modalElem().addEventListener("keydown", evt => {
            if (evt.key === "Enter" && !evt.target.matches(".cancel")) {
                modal.close(true);
            }
        });
    }).afterClose((modal, event) => {
        if (!event.detail) {
            fun('');
            modal.destroy();
            return;
        }
        let t:any = document.getElementById('picomodalprompt');
        if (t && t.value)
            fun(t.value);
        else
            fun('');
        modal.destroy();
    }).show();
}

export function askUserModal(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p class='footer'>" +
            "<button class='cancel'>Cancel</button> " +
            "<button class='ok'>Ok</button>" +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".ok")) {
                modal.close(true);
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close();
            }
        });
        modal.modalElem().addEventListener("keydown", evt => {
            if (evt.key === "Enter" && !evt.target.matches(".cancel")) {
                modal.close(true);
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail ? true : false);
    }).show();
}

export function askUserModalYesNoCancel(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p class='footer'>" +
            "<button class='yes'>Save</button>" +
            "<button class='no'>Don't save</button>" +
            "<button class='cancel'>Cancel</button> " +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".yes")) {
                modal.close('yes');
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close('cancel');
            } else if (evt.target && evt.target.matches(".no")) {
                modal.close('no');
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail);
    }).show();
}

export function askUserModalForOdd(previousname, loaded, fun) {
    let askoddInfo = msg.msg('askoddInfo');
    let askoddCurrent = msg.msg('askoddCurrent');
    let askoddLocalOdd = msg.msg('askoddLocalOdd');
    let askoddPredef = msg.msg('askoddPredef');
//    let askoddOk = msg.msg('ok');
    let askoddCancel = msg.msg('cancel');

    let box = '<div id="aumomodal"><p class="aumo aumotitle">' + askoddInfo + '</p>' +
    (loaded ? "<button class='aumo aumobutton current'>" + askoddCurrent + " " + previousname + "</button>" : "")
        + "<button class='aumo aumobutton computer'>" + askoddLocalOdd + "</button>" +
        '<p class="aumo aumoinfo">' + askoddPredef + "<p/>";

    for (let s=0; s < (msg.oddpredefs()).length; s++) {
        box += "<button class='aumo aumobutton aumoid" + s + "'>" + (msg.oddpredefs())[s].label + "</button>";
    }

    box += "<button class='aumo aumocancel cancel'>" + askoddCancel + "</button></div>";

    picoModal({
        content: box
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target) {
                if (evt.target.matches(".current")) {
                    modal.close('current');
                } else if (evt.target.matches(".computer")) {
                    modal.close('computer');
                } else if (evt.target.matches(".cancel")) {
                    modal.close('cancel');
                } else {
                    for (let s=0; s < (msg.oddpredefs()).length; s++) {
                        let l = "aumoid" + s;
                        if (evt.target.matches("." + l)) {
                            modal.close(l);
                        }
                    }
                }
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail);
    }).show();
}
