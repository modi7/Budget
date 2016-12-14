sap.ui.define([
	"budget/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function (Controller, JSONModel, History) {
	"use strict";
	return Controller.extend("budget.controller.CcDetermination", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf budget.view.CcDetermination
		 */
onInit: function () {
	
				var iOriginalBusyDelay, dDate = new Date(),
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					deleteVisible: false,
					saveVisible: false,
				});
			this.setModel(oViewModel, "CCView");
	
	
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
		/**
	*@memberOf budget.controller.CcDetermination
	*/
onAddPress: function () {
//This code was generated by the layout editor.
		},
		/**
	*@memberOf budget.controller.CcDetermination
	*/
onRemovePress: function () {
//This code was generated by the layout editor.
		},
		
		/* =========================================================== 
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Set Busy Dialog for table.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */		
		_initBindingEventHandler: function() {
			var oTable = this.byId("CCTable");
			var oBusyIndicator = oTable.getNoData();
			var oBinding = oTable.getBinding("rows");
			oBinding.attachDataRequested(function() {
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function(oEvent) {
				var oData = oEvent.getParameter("data");
				oTable.setNoData(null);
			});
		},		
		
	});
});