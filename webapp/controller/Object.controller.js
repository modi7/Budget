/*global location*/
sap.ui.define([
	"budget/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"budget/model/formatter"
], function(BaseController, JSONModel, History, Filter, FilterOperator, formatter) {
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
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay, dDate = new Date(),
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					year: dDate.getFullYear(),
					month: dDate.getMonth() + 1
				});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
			var oTable = this.byId("table");
			var oFilter = new Filter({
				filters: [
					new sap.ui.model.Filter({
						path: "Year",
						operator: "EQ",
						value1: dDate.getFullYear()
					}),
					new sap.ui.model.Filter({
						path: "Month",
						operator: "EQ",
						value1: dDate.getMonth() + 1
					})
				],
				and: true
			});
			
			this.oBusyIndicator = oTable.getNoData();
this.initBindingEventHandler ();
			oTable.bindRows({
				path: "Ecritures",
				filters: oFilter,
				shareable: true
			}); //	iRows.filter(oFilter);
			
					//	this.initBindingEventHandler ();
		},
		
		_filterTable:function(){
					var oFilter = new Filter({
				filters: [
					new sap.ui.model.Filter({
						path: "Year",
						operator: "EQ",
						value1: this.getModel("objectView").getProperty("/year")
					}),
					new sap.ui.model.Filter({
						path: "Month",
						operator: "EQ",
						value1: this.getModel("objectView").getProperty("/month")
					})
				],
				and: true
			});
			this.byId("table").getBinding("rows").filter(oFilter);
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
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Balance", {
					id: sObjectId
				});
				this._bindView("/" + sObjectPath);
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
		
		initBindingEventHandler : function(){
			var oBusyIndicator = this.oBusyIndicator;
			var oTable = this.byId("table");
			var oBinding = oTable.getBinding("rows");
			oBinding.attachDataRequested(function(){
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function(){
				oTable.setNoData(null); //Use default again ("No Data" in case no data is available)
			});
		},		
		
		/**
		 *@memberOf budget.controller.Object
		 */
		onSelectionChange: function() {
			//This code was generated by the layout editor.
			this._filterTable();
		}
	});
});