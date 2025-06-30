// sap.ui.define([
//   "sap/ui/core/util/MockServer",
//   "sap/base/Log"
// ], function (MockServer, Log) {
//   "use strict";

//   return {
//     init: function () {
//       var oMockServer = new MockServer({
//         rootUri: "localservice/Northwind/"
//       });

//       // simulate the service
//       oMockServer.simulate("localservice/metadata.xml", {
//         sMockdataBaseUrl: "localservice/mockdata",
//         bGenerateMissingMockData: true
//       });

//       oMockServer.start();

//       Log.info("MockServer started");
//     }
//   };
// });


sap.ui.define([
  "sap/ui/core/util/MockServer",
  "sap/base/Log"
], function (MockServer, Log) {
  "use strict";

  return {
    init: function () {
      var oMockServer = new MockServer({
        rootUri: "localservice/Northwind/"
      });

      // simulate the service
      oMockServer.simulate("localservice/metadata.xml", {
        sMockdataBaseUrl: "localservice/mockdata",
        bGenerateMissingMockData: true
      });

      // ✅ Add this to log GET requests
      oMockServer.attachAfter("GET", function (oEvent) {
        console.log("Handled GET:", oEvent.getParameter("request").requestUri);
      });

      oMockServer.start();

      Log.info("MockServer started");
    }
  };
});
