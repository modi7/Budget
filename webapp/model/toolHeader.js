sap.ui.define([], function() {
	"use strict";

	return {

		onCCDetermination: function(oEvent) {
			/** @type sap.m.routing.Router */
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detAffectation", null, true);
			//oRouter.getTargets().display("detAffectation");
		}
	};

});