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
    }).afterClose((modal, event) => {
        fun(event.detail ? true : false);
    }).show();
}

export function askUserModalYesNoCancel(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p class='footer'>" +
            "<button class='yes'>Sauver</button>" +
            "<button class='no'>Ne pas sauver</button>" +
            "<button class='cancel'>Annuler</button> " +
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
    let s1 = "You must choose an ODD file. Please make a choice.";
    let s2 = "Use the currently loaded ODD:";
    let s3 = "Choose and ODD file on your computer";
    let s4 = "Choose a predefined ODD file:";
    let s5 = "Ok.";
    let s6 = "Cancel";
    let s91 = msg.msg("oddteispoken");
    let s92 = msg.msg("oddolac");
    let s93 = msg.msg("oddmedia");
    picoModal({
        content: '<p>' + s1 + '</p>' +
            (loaded ? "<button class='current'>" + s2 + " " + previousname + "</button>" : "") +
            "<button class='computer'>" + s3 + "</button><br/>" +
            s4 + "<br/>" +
            "<button class='s91'>" + s91 + "</button><br/>" +
            "<button class='s92'>" + s92 + "</button><br/>" +
            "<button class='s93'>" + s93 + "</button><br/>" +
            "<p class='footer'>" +
//            "<button class='ok'>" + s5 + "</button>" +
            "<button class='cancel'>" + s6 + "</button>" +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".current")) {
                modal.close('current');
            } else if (evt.target && evt.target.matches(".computer")) {
                modal.close('computer');
            } else if (evt.target && evt.target.matches(".s91")) {
                modal.close('oddteispoken');
            } else if (evt.target && evt.target.matches(".s92")) {
                modal.close('oddolac');
            } else if (evt.target && evt.target.matches(".s93")) {
                modal.close('oddmedia');
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close('cancel');
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail);
    }).show();
}
