var $ = function (id) {
    return "string" == typeof id ? document.getElementById(id) : id;
};
var Bind = function (object, fun) {
    return function () {
        return fun.apply(object, arguments);
    };
};

var BindAsEventListener = function (object, fun) {
    return function (event) {
        return fun.call(object, (event || window.event));
    };
};

function addEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = fnHandler;
    }
};

function removeEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = null;
    }
};
var Class = {
    create: function () {
        return function () { this.initialize.apply(this, arguments); };
    }
};