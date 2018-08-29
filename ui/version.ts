/**
 * version.ts
 */

import * as alert from '../teiedit/alert';
import * as msg from '../msg/messages';

export let version = '0.6.3';
export let date = '29-08-2018';

export function about() {
    var s = msg.msg('versionname') + version + " - " + date + "</br></br>";
    s += msg.msg('shorthelp');
    alert.alertUser(s);
};
