sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "./model/models",
    "./localservice/mockserver",
  ],
  function (UIComponent, JSONModel, models, mockserver) {
    "use strict";

    return UIComponent.extend("ui5.walkthrough.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        try {
          // Start the mock server

          // Call the base component's init function
          UIComponent.prototype.init.apply(this, arguments);
          // console.log("Mockserver test start!");
          // mockserver.init();
          // console.log("Mockserver init called!");

          // set up device model
          this.setModel(models.createDeviceModel(), "device");

          // initialize router
          this.getRouter().initialize();
        } catch (oError) {
          console.error("Component initialization failed:", oError);
        }
      },
    });
  }
);
