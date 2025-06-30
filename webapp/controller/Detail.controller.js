sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function (Controller, History) {
  "use strict";

  return Controller.extend("ui5.walkthrough.controller.Detail", {
    onInit: function () {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function (oEvent) {
      const sOrderID = oEvent.getParameter("arguments").OrderID;
      const sPath = "/Orders(" + sOrderID + ")";
      const oView = this.getView();

      oView.bindElement({
        path: sPath,
        parameters: {
          expand: "Customer,Order_Details/Product"
        },
        events: {
          dataRequested: function () {
            oView.setBusy(true);
          },
          dataReceived: function () {
            oView.setBusy(false);
            console.log("Order data bound successfully to", sPath);
          }
        }
      });
    },

    onNavBack: function () {
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("overview", {}, true);
      }
    },

    onPanelToggle: function () {
      // Optional: log toggle or perform future UI changes
      console.log("Panel toggled");
    }
  });
});
