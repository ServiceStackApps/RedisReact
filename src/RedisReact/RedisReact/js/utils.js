function findPotentialKeys(o) {
    var keys = [];
    if (typeof o == 'object') {
        for (var k in o) {
            if (k.length > 2 && k.endsWith('Id') && k.indexOf("'") == -1) {
                var v = o[k];
                var ref = "urn:" + k.substring(0, k.length - 2).toLowerCase() + ":" + v;
                keys.push(ref);
            }
        }
    }
    return keys;
}

function isJsonObject(s) {
    if (typeof s != 'string')
        return false;

    var isComplexJson = s.indexOf('{') >= 0 || s.indexOf('[') >= 0;
    return isComplexJson;
}

function hasTextSelected() {
    return !!window.getSelection && window.getSelection().toString();
}

function selectText(el) {
    if (!window.getSelection) return;
    var range = document.createRange();
    range.selectNode(el);
    window.getSelection().addRange(range);
}

//from jsonviewer
function date(s) { return new Date(parseFloat(/Date\(([^)]+)\)/.exec(s)[1])); }
function pad(d) { return d < 10 ? '0' + d : d; }
function dmft(d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()); }
function valueFmt(v) {
    if (typeof v != "string")
        return v;

    var s = v.startsWith('/Date(') ? dmft(date(v)) : v;
    return s;
}
