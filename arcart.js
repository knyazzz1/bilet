if (!window.lsport) window.lsport = {};
if (!lsport.ar) lsport.ar = {};
if (!lsport.ar.cart) lsport.ar.cart = {
    _items: [],
    _due: 0,
    _btn: null,
    getDue: function () { return _due; },
    hide: function () { if (this._btn) this._btn.hide(); },
    show: function () { if (this._btn) this._btn.show(); },
    init: function (btnOptions, due) {
        this._btn = $("<button type='button'></button>").appendTo($("body")).kendoFloatingActionButton({
            icon: "cart",
            positionMode: "fixed",
            align: "bottom end",
            alignOffset: { x: 100, y: 30 },
            themeColor: "danger",
            size: "medium",
            click: function () { lsport.ar.cart.pay(); }
        }, $.extend(btnOptions ? btnOptions : {})).getKendoFloatingActionButton();
        this.updateDue(due);
    },
    updateDue: function (due) {
        this._due = due;
        this._btn.text(due);
        if (due) this._btn.show();
        else this._btn.hide();
    },
    payImmediate: function (items, args, success, error, payTitle, payButton, pfx) {
        $.ajax({
            type: "POST",
            url: "/data/AR/BeginPayment?pfx=" + pfx,
            data: JSON.stringify({
                items: JSON.stringify(items),
                args: args ? JSON.stringify(args) : null
            }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            converters: {
                "text json": function (data) {
                    return $.parseJSON(data, true);
                }
            },
            error: function (x) {
                var msg = null;
                var resp = JSON.parse(x.responseText);
                if (resp.Message) msg = resp.ExceptionMessage ? resp.ExceptionMessage : (resp.MessageDetail ? resp.MessageDetail : resp.Message);
                else if ($.isArray(resp)) {
                    msg = $.map(resp, function (itm) { return itm.value; }).join("\n");
                }
                if (error) error(msg);
                else alert(msg);
            },
            success: function (resp) {
                var payUrl = resp.url;
                var wallet = resp.wallet;
                try { lsport.ar.cart.payWindow = window.open(payUrl); } catch (er) { }
                if (!lsport.ar.cart.payWindow) {
                    if (!lsport.ar.cart.alertWin) {
                        lsport.ar.cart.alertWin = $('<div id="arcart-win-pay" style="max-width:400px"><div class="d-flex justify-content-center w-100"><a href="#" id="arcart-pay-link" target="_blank" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary">' + payButton + '</a></div></div>').appendTo("body").kendoWindow({
                            title: { text: payTitle },
                            activate: function (e) {
                                var win = e.sender.wrapper;
                                if ('parentIFrame' in window) setTimeout(function () {
                                    parentIFrame.scrollToOffset(0, Math.max(win.offset().top - 50, 0));
                                }, 100);
                            },
                            visible: false,
                            modal: { preventScroll: true }
                        }).getKendoWindow();
                        $("#arcart-pay-link").click(function () { lsport.ar.cart.alertWin.close(); })
                    }
                    $("#arcart-pay-link").attr("href", payUrl);
                    lsport.ar.cart.alertWin.open().center();
                }
                lsport.ar.cart.wallet = wallet;
                if (!lsport.ar.cart.connected) {
                    lsport.ar.cart.connected = true;
                    lsport.ar.cart.cartHub = $.connection.cart;
                    lsport.ar.cart.cartHub.client.paid = function () {
                        if (lsport.ar.cart.payWindow) lsport.ar.cart.payWindow.close();
                        if (success) success();
                    };
                    $.connection.hub.start().done(function () {
                        lsport.ar.cart.cartHub.server.wait(wallet);
                    });
                    $.connection.hub.reconnected(function () {
                        lsport.ar.cart.cartHub.server.wait(wallet);
                    });
                    $.connection.hub.disconnected(function () {
                        setTimeout(function () { $.connection.hub.start(); }, 3000);
                    });
                }
            }
        });
    },
    add: function (items, success, error) {
        $.ajax({
            type: "POST",
            url: "/data/AR/AddCartItems",
            data: JSON.stringify({ items: JSON.stringify(items) }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            converters: {
                "text json": function (data) {
                    return $.parseJSON(data, true);
                }
            },
            error: function (x) {
                var msg = null;
                var resp = JSON.parse(x.responseText);
                if (resp.Message) msg = resp.ExceptionMessage ? resp.ExceptionMessage : (resp.MessageDetail ? resp.MessageDetail : resp.Message);
                else if ($.isArray(resp)) {
                    msg = $.map(resp, function (itm) { return itm.value; }).join("\n");
                }
                if (error) error(msg);
                else alert(msg);
            },
            success: function (resp) {
                lsport.ar.cart.updateDue(resp.due);
                //lsport.ar.cart.updateItems(resp.items);
                if (success) success(resp);
            }
        });
    },
    remove: function (items, success, error) {
        $.ajax({
            type: "POST",
            url: "/data/AR/RemoveCartItems",
            data: JSON.stringify({ items: JSON.stringify(items) }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            converters: {
                "text json": function (data) {
                    return $.parseJSON(data, true);
                }
            },
            error: function (x) {
                var msg = null;
                var resp = JSON.parse(x.responseText);
                if (resp.Message) msg = resp.ExceptionMessage ? resp.ExceptionMessage : (resp.MessageDetail ? resp.MessageDetail : resp.Message);
                else if ($.isArray(resp)) {
                    msg = $.map(resp, function (itm) { return itm.value; }).join("\n");
                }
                if (error) error(msg);
                else alert(msg);
            },
            success: function (resp) {
                lsport.ar.cart.updateDue(resp.due);
                //lsport.ar.cart.updateItems(resp.items);
                if (success) success(resp);
            }
        });
    },
    clear: function (success, error) {
        $.ajax({
            type: "POST",
            url: "/data/AR/ClearCart",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            converters: {
                "text json": function (data) {
                    return $.parseJSON(data, true);
                }
            },
            error: function (x) {
                var msg = null;
                var resp = JSON.parse(x.responseText);
                if (resp.Message) msg = resp.ExceptionMessage ? resp.ExceptionMessage : (resp.MessageDetail ? resp.MessageDetail : resp.Message);
                else if ($.isArray(resp)) {
                    msg = $.map(resp, function (itm) { return itm.value; }).join("\n");
                }
                if (error) error(msg);
                else alert(msg);
            },
            success: function (resp) {
                lsport.ar.cart.updateDue(resp.due);
                //lsport.ar.cart.updateItems(resp.items);
                if (success) success(resp);
            }
        });
    },
    reload: function (success, error) {
        $.ajax({
            type: "POST",
            url: "/data/AR/LoadCart",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            converters: {
                "text json": function (data) {
                    return $.parseJSON(data, true);
                }
            },
            error: function (x) {
                var msg = null;
                var resp = JSON.parse(x.responseText);
                if (resp.Message) msg = resp.ExceptionMessage ? resp.ExceptionMessage : (resp.MessageDetail ? resp.MessageDetail : resp.Message);
                else if ($.isArray(resp)) {
                    msg = $.map(resp, function (itm) { return itm.value; }).join("\n");
                }
                if (error) error(msg);
                else alert(msg);
            },
            success: function (resp) {
                lsport.ar.cart.updateDue(resp.due);
                //lsport.ar.cart.updateItems(resp.items);
                if (success) success(resp);
            }
        });
    },
    pay: function (oneclick) {
        var w = window.open("/AR/Cart/?blank=true" + (oneclick ? "&oneclick=true" : ""));
    }
}