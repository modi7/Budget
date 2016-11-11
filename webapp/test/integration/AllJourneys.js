jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"budget/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"budget/test/integration/pages/Worklist",
		"budget/test/integration/pages/Object",
		"budget/test/integration/pages/NotFound",
		"budget/test/integration/pages/Browser",
		"budget/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "budget.view."
	});

	sap.ui.require([
		"budget/test/integration/WorklistJourney",
		"budget/test/integration/ObjectJourney",
		"budget/test/integration/NavigationJourney",
		"budget/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});
