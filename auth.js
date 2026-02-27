if (!window.lsport) window.lsport = {};
lsport.auth = {
    getMachineInfo: function () {
        var mid = localStorage.getItem("lsport.machine");
        if (!mid) {
            try { mid = crypto.randomUUID(); }
            catch {
                mid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            localStorage.setItem("lsport.machine", mid);
        }
        var nav = navigator;
        return {
            info: kendo.format("{0}; {1}; {2}; {3}", nav.platform, nav.product, nav.appVersion, nav.productSub),
            id: mid
        };
    }
}