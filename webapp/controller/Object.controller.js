/*global location*/
sap.ui.define([
	"budget/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"budget/model/formatter",
	"sap/m/MessageBox",
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format'
], function(BaseController, JSONModel, History, Filter, FilterOperator, formatter, MessageBox, ChartFormatter, Format) {
	"use strict";
	return BaseController.extend("budget.controller.Object", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// this._initCustomFormat();
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay, dDate = new Date(),
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					year: dDate.getFullYear(),
					month: dDate.getMonth() + 1,
					deleteVisible: false,
					saveVisible: false,
					selectedType: null
				});
			this.setModel(oViewModel, "objectView");
			this._oDialogModel = new JSONModel({
				montant: null,
				debitCredit: false,
				saveEnabled: false,
				minDate: null,
				maxDate: null,
				textDebitCredit: "D\xE9bit",
				iconDebitCredit: "sap-icon://less"
			});
			this.setModel(this._oDialogModel, "newView");
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
		
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			this._initViz();

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
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
		onSelectionChange: function() {
			//This code was generated by the layout editor.
			this._filterTable();
		},
		/**
		 *@memberOf budget.controller.Object
		 */
		onAddPress: function() {
			//This code was generated by the layout editor.
			if (!this._newDialog) {
				this._newDialog = sap.ui.xmlfragment(this.getView().getId(), "budget.fragment.newEcriture", this);
				this.getView().addDependent(this._newDialog);
			}
			var oViewModel = this.getModel("objectView");
			var oLocData = {
				montant: null,
				debitCredit: false,
				saveEnabled: false,
				minDate: new Date(oViewModel.getProperty("/year"), oViewModel.getProperty("/month") - 1, 1),
				maxDate: new Date(oViewModel.getProperty("/year"), oViewModel.getProperty("/month"), 0),
				textDebitCredit: "D\xE9bit",
				iconDebitCredit: "sap-icon://less"
			};
			this._oDialogModel.setData(oLocData);
			//	var oDate = sap.ui.core.Fragment.byId("newDialog", "newDate");
			var oDate = this.byId("newDate");
			if (oDate.setMinDate) {
				oDate.setMinDate(oLocData.minDate);
				oDate.setMaxDate(oLocData.maxDate);
			}
			var oContext = this.getModel().createEntry("Ecritures", {
				//		success: this._fnEntityCreated.bind(this),
				//		error: this._fnEntityCreationFailed.bind(this),
				properties: {
					CompteId: this.getView().getBindingContext().getProperty("id"),
					Month: oViewModel.getProperty("/month"),
					Year: oViewModel.getProperty("/year"),
					Date: new Date().getTime() > oLocData.maxDate.getTime ? oLocData.maxDate : new Date()
				}
			});
			this._newDialog.setModel(this._oDialogModel, "newView");
		//	this._newDialog.setModel(this.getModel());
		//	this._newDialog.setModel(this.getModel("appView"), "appView");
			this._newDialog.setBindingContext(oContext);
			this._newDialog.open();
		},
		onSelectionTableChange: function() {
			var aRows = this.byId("table").getSelectedIndices();
			this.getModel("objectView").setProperty("/deleteVisible", aRows.length > 0 ? true : false);
		},
		onTogglePress: function(oEvent) {
			var oModel = this._newDialog.getModel("newView");
			if (oEvent.getParameter("pressed")) {
				oModel.setProperty("/textDebitCredit", "Cr\xE9dit");
				oModel.setProperty("/iconDebitCredit", "sap-icon://add");
			} else {
				oModel.setProperty("/textDebitCredit", "D\xE9bit");
				oModel.setProperty("/iconDebitCredit", "sap-icon://less");
			}
		},
		onDialogSave: function() {
			var oModel = this._newDialog.getModel("newView");
			var oOdataModel = this.getModel();
			if (oModel.getProperty("/debitCredit")) {
				this.byId("DialogDebit").setValue(null);
				this.byId("DialogCredit").setValue(oModel.getProperty("/montant"));
			} else {
				this.byId("DialogCredit").setValue(null);
				this.byId("DialogDebit").setValue(oModel.getProperty("/montant"));
			}
			this.byId("DialogCarte").setValue(oModel.getProperty("/carte") ? "O" : null);
			oOdataModel.submitChanges();
			this._newDialog.close();
			oOdataModel.refresh();
		},
		onDialogCancel: function() {
			MessageBox.confirm("Are you sur you want to Cancel?", {
				//	styleClass: oComponent.getContentDensityClass(),
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						this.getModel().resetChanges();
						this._newDialog.close();
					}
				}.bind(this)
			});
		},
		onFormChange: function() {
			var aInputControls = this._getFormFields(this.byId("dialogSimpleForm"));
			var oControl, bError = false;
			aInputControls.forEach(function(item, index) {
				oControl = item.control;
				var sValue;
				if (item.required) {
					if (oControl.getValue) {
						sValue = oControl.getValue();
					} else {
						sValue = oControl.getSelectedKey();
					}
					if (!sValue) {
						bError = true;
						return;
					}
				}
			}, this);
			this._newDialog.getModel("newView").setProperty("/saveEnabled", !bError);
		},
		onDeletePress: function() {
			//This code was generated by the layout editor.
			/** @type sap.ui.table.Table */
			var oTable = this.byId("table");
			//var aContexts = oTable.getBinding("rows").getContexts();// .getRows();
			var aIndex = oTable.getSelectedIndices();
			var iLength = aIndex.length - 1;
			//deleteCreatedEntry
			var oModel = this.getModel();
			//							oModel.setDeferredBatchGroups(["EcritureDelete"]);
			//	src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
			aIndex.forEach(function(item, index) {
				if (iLength === index) {
					oModel.remove(oTable.getContextByIndex(item).getPath(), {
						success: this._deleteSuccess.bind(this)
					});
				} else {
					oModel.remove(oTable.getContextByIndex(item).getPath());
				}
			}, this);
			oTable.removeSelectionInterval(0, 50);
		},

		onFileChange: function(oEvent) {
			//This code was generated by the layout editor.
			var oModel = this.getModel("objectView");
			if (oEvent.getParameter("newValue") !== "") {
				this.getModel("appView").setProperty("/file", oEvent.getParameter("files")[0])
				this.getRouter().navTo("upload", {
					month: oModel.getProperty("/month"),
					year: oModel.getProperty("/year"),
					id: this.getView().getBindingContext().getProperty("id"),
					description: this.getView().getBindingContext().getProperty("Description")
					//,file: oEvent.getParameter("files")[0]					
				});
			}
		},
		/**
		 *@memberOf budget.controller.Object
		 */
		onSavePress: function() {
			//This code was generated by the layout editor.

			/** @Type sap.ui.model.odata.V2.OdataModel */
			var oModel = this.getModel();

			if (oModel.hasPendingChanges()) {
				oModel.submitChanges();
				this.getModel("objectView").setProperty("/saveVisible", false);
			}
		},
		/**
		 *@memberOf budget.controller.Object
		 */
		onAffectationChange: function() {
			//This code was generated by the layout editor.
			if (this.getModel().hasPendingChanges()) {
				this.getModel("objectView").setProperty("/saveVisible", true);

			}
		},

		onSelectData: function(oEvent) {

			var oObject = oEvent.getParameter("data")[0];

			var aAffectations = this.getModel("appView").getProperty("/Affectations");
			//console.log("Selection : " + oObject.data.Type);
			var oAffectation = aAffectations.find(function(item) {
				return item.Description === oObject.data.Type;
			});

			this.getModel("objectView").setProperty("/selectedType", oObject.data.Type);

			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("rows");

			var oFilter1 = new Filter({
				filters: [
					new Filter({
						path: "Year",
						operator: "EQ",
						value1: this.getModel("objectView").getProperty("/year")
					}),
					new Filter({
						path: "Month",
						operator: "EQ",
						value1: this.getModel("objectView").getProperty("/month")
					})
				],
				and: true
			});

			var oFilter = new Filter({
				filters: [
					oFilter1,
					new Filter({
						path: "AffectationId",
						operator: "EQ",
						value1: oAffectation.id
					})
				],
				and: true
			});

			oBinding.filter([oFilter]);

		},

		onDeselectData: function(oEvent) {
			var oObject = oEvent.getParameter("data")[0];
			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("rows");

			if (this.getModel("objectView").getProperty("/selectedType") === oObject.data.Type) {
				var oFilter = new Filter({
					filters: [
						new Filter({
							path: "Year",
							operator: "EQ",
							value1: this.getModel("objectView").getProperty("/year")
						}),
						new Filter({
							path: "Month",
							operator: "EQ",
							value1: this.getModel("objectView").getProperty("/month")
						})
					],
					and: true
				});

				oBinding.filter([oFilter]);
			}
		},

		/* =========================================================== 
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_filterTable: function() {
			var oFilter = new Filter({
				filters: [
					new Filter({
						path: "Year",
						operator: "EQ",
						value1: this.getModel("objectView").getProperty("/year")
					}),
					new Filter({
						path: "Month",
						operator: "EQ",
						value1: this.getModel("objectView").getProperty("/month")
					})
				],
				and: true
			});
			this.byId("table").getBinding("rows").filter(oFilter);
			this.byId("vizData").getBinding("data").filter(oFilter);

			var oModel = this.getModel("objectView");
			var iId = this.getView().getBindingContext().getProperty("id");
			var sSoldePath = this.getModel().createKey("SoldeMois", {
				id: iId.toString() + oModel.getProperty("/year") + oModel.getProperty("/month")
			});
			this._bindDetailPanel("/" + sSoldePath);
		},

		_onObjectMatched: function(oEvent) {
			this.byId("fileUploader").setValue(null);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/year", new Date().getFullYear());
			oViewModel.setProperty("/month", new Date().getMonth() + 1);
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Balance", {
					id: sObjectId
				});
				this._bindView("/" + sObjectPath);
				var oModel = this.getModel("objectView");
				var sSoldePath = this.getModel().createKey("SoldeMois", {
					id: sObjectId + oModel.getProperty("/year") + oModel.getProperty("/month")
				});
				this._bindDetailPanel("/" + sSoldePath);
				this._initBindingEventHandler();
				this._filterTable();
			}.bind(this));
		},
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_bindDetailPanel: function(sObjectPath) {
			//console.log(sObjectPath);
			this.byId("detailPanel").bindElement({
				path: sObjectPath
			});
		},
		_initBindingEventHandler: function() {
			var oTable = this.byId("table");
			var oBusyIndicator = oTable.getNoData();
			var oBinding = oTable.getBinding("rows");
			oBinding.attachDataRequested(function() {
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function(oEvent) {
				var oData = oEvent.getParameter("data");
				oTable.setNoData(null);
				//Use default again ("No Data" in case no data is available)
				if (oData) {
					oTable.setVisibleRowCount(oData.results.length > 20 ? 20 : oData.results.length > 0 ? oData.results.length : 1);
				}
			});
		},
		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.id,
				sObjectName = oObject.Description;
			// Everything went fine.
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));
		},
		_getFormFields: function(oSimpleForm) {
			var aControls = [];
			var aFormContent = oSimpleForm.getContent();
			var sControlType;
			for (var i = 0; i < aFormContent.length; i++) {
				sControlType = aFormContent[i].getMetadata().getName();
				if (sControlType === "sap.m.Input" || sControlType === "sap.m.DatePicker" || sControlType === "sap.m.ComboBox") {
					aControls.push({
						control: aFormContent[i],
						required: aFormContent[i - 1].getRequired && aFormContent[i - 1].getRequired()
					});
				}
			}
			return aControls;
		},
		/**
		 *@memberOf budget.controller.Object
		 */
		_initCustomFormat: function() {
			var chartFormatter = this.chartFormatter = ChartFormatter.getInstance();
			chartFormatter.registerCustomFormatter("__UI5__FloatMaxFraction2",
				function(value) {
					var fixedFloat = sap.ui.core.format.NumberFormat.getFloatInstance({
						style: 'Standard',
						maxFractionDigits: 2,
						minFractionDigits: 2
					});
					return fixedFloat.format(value);
				});
			Format.numericFormatter(chartFormatter);
		},

		_deleteSuccess: function() {
			this.getModel().refresh();
		},

		_initViz: function() {

			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			//	var oPopOver = this.getView().byId("idPopOver");
			//	oPopOver.connect(oVizFrame.getVizUid());
			//	oPopOver.setFormatString("__UI5__FloatMaxFraction2");
			oVizFrame.setVizProperties({
				title: {
					visible: true,
					text: 'Répartition'
				},
				interaction: {
					behaviorType: null,
					selectability: {
						mode: "SINGLE"
					}
				},
				tooltip: {
					visible: true,
					formatString: "__UI5__FloatMaxFraction2",
					bodyDimensionLabel: "Type",
					bodyDimensionValue: "Type"
				},
				legend: {
					visible: false
				}

			});

			this._initCustomFormat();
		}

	});
});