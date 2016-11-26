sap.ui.define([
	"budget/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function(Controller, JSONModel, History, MessageBox) {
	"use strict";

	return Controller.extend("budget.controller.NewEcriture", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf budget.view.NewEcriture
		 */
		onInit: function() {
			this.getRouter().getTargets().getTarget("new").attachDisplay(null, this._onNew, this);
			var oViewModel = new JSONModel({
				montant: null,
				debitCredit: false,
				saveEnabled: false,
				minDate: null,
				maxDate: null
			});
			this.setModel(oViewModel, "newView");
			//	
		},

		onCancel: function() {

			MessageBox.confirm("Are you sur you want to Cancel?", {
				//	styleClass: oComponent.getContentDensityClass(),
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						//that.getModel("appView").setProperty("/addEnabled", true);
						this.getModel().resetChanges();
						this._navBack();
					}
				}.bind(this)
			});

		},

		_navBack: function() {
			/*			var sPreviousHash = History.getInstance().getPreviousHash();
						if (sPreviousHash !== undefined) {
							history.go(-1);
						} else {*/
			//this.getRouter().navTo("object", {}, true);
			this.getRouter().getTargets().display("object");
			// }
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf budget.view.NewEcriture
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf budget.view.NewEcriture
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf budget.view.NewEcriture
		 */
		//	onExit: function() {
		//
		//	}
		_onNew: function(oEvent) {
			var oData = oEvent.getParameter("data");
			var oModel = this.getModel("newView");
			var oLocData = oModel.getData();
			oLocData.montant = null;
			oLocData.debitCredit = false;
			oLocData.saveEnabled = false;
			oLocData.minDate = new Date(oData.year, oData.month - 1, 1);
			oLocData.maxDate = new Date(oData.year, oData.month , 0);

			//					this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("createViewTitle"));
			//	this._oViewModel.setProperty("/mode", "create");
			//	this.getView().byId("fileUploader").clear();
			var oContext = this.getModel().createEntry("Ecritures", {
				//		success: this._fnEntityCreated.bind(this),
				//		error: this._fnEntityCreationFailed.bind(this),
				properties: {
					CompteId: oData.id,
					Month: oData.month,
					Year: oData.year
				}
			});
			this.getView().setBindingContext(oContext);

		}
	});

});