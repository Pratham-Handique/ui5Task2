sap.ui.define([
  "sap/ui/core/format/DateFormat"
], function (DateFormat) {
  "use strict";

  return {
    formatDate: function (sValue) {
      if (!sValue) return "";
      
      try {
        var oDate = new Date(sValue);
        return DateFormat.getDateInstance({
          pattern: "yyyy-MM-dd",
          UTC: true
        }).format(oDate);
      } catch (oError) {
        console.error("Date formatting error:", oError);
        return sValue;
      }
    }
  };
});