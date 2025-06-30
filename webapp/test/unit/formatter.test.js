sap.ui.define(["ui5/walkthrough/formatter/formatter"], function (formatter) {
  "use strict";
  console.log("formatter.test.js loaded ✅");
  QUnit.module("Formatter");

  QUnit.test("Should format date correctly", function (assert) {
    const result = formatter.formatDate("2024-12-25T00:00:00Z");
    assert.strictEqual(result, "2024-12-25", "Formatted date is correct");
  });

  QUnit.test("Should return empty string for null value", function (assert) {
    const result = formatter.formatDate(null);
    assert.strictEqual(result, "", "Returns empty string");
  });
});
