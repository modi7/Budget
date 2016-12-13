sap.ui.define([
		"budget/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"budget/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/routing/History",
		"budget/model/toolHeader",
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, History, toolHeader) {
		"use strict";

		return BaseController.extend("budget.controller.Worklist", {

			formatter: formatter,
			
			toolHeader: toolHeader,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel;

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");

			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */

					onTilePress: function(oEvent) {
			//This code was generated by the layout editor.
			this._showObject(oEvent.getSource());

		},


			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser historz
			 * @public
			 */
			onNavBack : function() {
				history.go(-1);
			},


			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("id")
				});
			}
			


		});
	}
);