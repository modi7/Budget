sap.ui.define([
	"budget/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function(Controller, JSONModel, History, MessageBox) {
	"use strict";
	return Controller.extend("budget.controller.Upload", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf budget.view.Upload
		 */
		onInit: function() {
			this.getRouter().getTargets().getTarget("upload").attachDisplay(null, this._onUpload, this);
			var oViewModel = new JSONModel({
				busy: false,
				id: null,
				month: null,
				year: null,
				deleteVisible: false,
				ecritures: []
			});
			this.setModel(oViewModel, "uploadView");
			this._reader = new FileReader();
			this._reader.addEventListener("load", this.onReaderLoad.bind(this), false);
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
		},

		onCancel: function() {
			if (this.getModel("uploadView").getProperty("/ecritures").length > 0) {

				MessageBox.confirm("Are you sur you want to Cancel?", {
					//	styleClass: oComponent.getContentDensityClass(),
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							
							this.getModel().resetChanges();
							this._navBack();

						}
					}.bind(this)
				});
			} else {
				this._navBack();
			}

		},

		_navBack: function() {
			/*			var sPreviousHash = History.getInstance().getPreviousHash();
						if (sPreviousHash !== undefined) {
							history.go(-1);
						} else {*/
			//this.getRouter().navTo("object", {}, true);
			this.getRouter().getTargets().display("object"); // }
		},

		_onUpload: function(oEvent) {
			var oData = oEvent.getParameter("data");
			var oModel = this.getModel("uploadView");
			oModel.setProperty("/id", oData.id);
			oModel.setProperty("/month", oData.month);
			oModel.setProperty("/year", oData.year);
			oModel.setProperty("/busy", true);
			this._reader.readAsText(oData.file);
			/*			
								var oContext = this.getModel().createEntry("Ecritures", {
											success: this._fnEntityCreated.bind(this),
											error: this._fnEntityCreationFailed.bind(this),
									properties: {
										CompteId: oData.id,
										Month: oData.month,
										Year: oData.year
									}
								});
								this.getView().setBindingContext(oContext);
					  */
		},

		onReaderLoad: function(oEvent) {
			if (oEvent.returnValue) {
				var oModel = this.getModel("uploadView");
				var aEcritures = [];
				var sContents = oEvent.target.result;
				var aContents = sContents.split("\r\n");
				var oTable = this.byId("uploadTable");
				aContents.forEach(function(item, index) {
					if (index > 0 && item.length > 0) {
						item = item.replace(new RegExp("\"", "g"), "");
						item = item.replace(new RegExp("\\r", "g"), "");
						item = item.replace(new RegExp(",", "g"), ".");
						var aColumns = item.split(";");
						var aDate = aColumns[0].trim().split("/");
						aEcritures.push({
							CompteId: oModel.getProperty("/id"),
							Month: oModel.getProperty("/month"),
							Year: oModel.getProperty("/year"),
							Date: new Date(aDate[2], aDate[1] - 1, aDate[0]),
							AffectationId: this._getCC(aColumns[2]),
							Debit: aColumns[6].indexOf("-") !== -1 ? Math.abs(parseFloat(aColumns[6].replace(/\s/g, "")).toFixed(2)) : null,
							//Debit: aColumns[6].indexOf("-") !== -1 ? aColumns[6].replace(/-/g, "") : null,
							Credit: aColumns[6].indexOf("-") === -1 ? Math.abs(parseFloat(aColumns[6].replace(/\s/g, ""))) : null,
							Description: aColumns[2],
							Carte: aColumns[8] === "CARTE PREMIER" ? "O" : null
						});
					}
				}, this);
				oModel.setProperty("/ecritures", aEcritures);
				oModel.updateBindings();
				jQuery.sap.delayedCall(0, this, function() {
					oTable.setVisibleRowCount(aEcritures.length > 20 ? 20 : aEcritures.length);
				});
			}
			this.getModel("uploadView").setProperty("/busy", false); //	var contents = event.target.result;
			//	var myTable = contents.split("\n");
		},

		onDeletePress: function() {
			var oTable = this.byId("uploadTable");
			var oModel = this.getModel("uploadView");
			var aEcritures = oModel.getProperty("/ecritures");
			var aIndex = oTable.getSelectedIndices();
			aIndex.forEach(function(item, index) {
				aEcritures.splice(item - index, 1);
			});
			oModel.setProperty("/ecritures", aEcritures);
			oModel.updateBindings();
			oTable.removeSelectionInterval(0, aEcritures.length);
			oTable.setVisibleRowCount(aEcritures.length > 20 ? 20 : aEcritures.length);
		},

		_getCC: function(description) {
			var aCle = this.getModel("appView").getProperty("/Cleaffectations");
			var iCc = aCle.find(function(item) {
				return description.toUpperCase().indexOf(item.Text.toUpperCase()) != -1;
			});
			if (iCc) {
				return iCc.AffectationId;
			}
			return 6;
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf budget.view.Upload
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf budget.view.Upload
		 */
		//	onAfterRendering: function() {
		//
		//	},
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf budget.view.Upload
		 */
		//	onExit: function() {
		//
		//	}

		/**
		 *@memberOf budget.controller.Upload
		 */
		onSelectionTableChange: function() {
			var aRows = this.byId("uploadTable").getSelectedIndices();
			this.getModel("uploadView").setProperty("/deleteVisible", aRows.length > 0 ? true : false);
		},

		onSavePress: function() {
			//This code was generated by the layout editor.

			var oModel = this.getModel("uploadView");
			var aEcritures = oModel.getProperty("/ecritures");
			var iLength = aEcritures.length;
			aEcritures.forEach(function(item, index) {
				if (iLength === index) {
					this.getModel().createEntry("Ecritures", {
						//success: this._addSuccess.bind(this),
						//error: this._fnEntityCreationFailed.bind(this),
						properties: item
					});
				} else {
					this.getModel().createEntry("Ecritures", {
						properties: item
					});
				}

			}, this);

			this.getModel().submitChanges();
			this._addSuccess();
		},

		_addSuccess: function() {
			this.getModel().refresh();
			this._navBack();
		}

	});
});