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
				year: null
			});
			this.setModel(oViewModel, "uploadView");

			this._reader = new FileReader();
			this._reader.addEventListener("load", this.onReaderLoad.bind(this), false);

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
			
				var sContents = oEvent.target.result;
				var aContents = sContents.split("\r\n");

           var oTable = this.byId("uploadTable");
            
            aContents.forEach(function(item, index){ 
                
               var aZones = item.split(";");
                var toto = new sap.ui.table.Row();
                		var oContext = this.getModel().createEntry("Ecritures", {
							//		success: this._fnEntityCreated.bind(this),
							//		error: this._fnEntityCreationFailed.bind(this),
							properties: {
								CompteId: oModel.getProperty("/id"),
								Month: oModel.getProperty("/month"),
								Year: oModel.getProperty("/year"),
								Description: "Test " + index
							}
						});
						try {
					toto.setBindingContext(oContext);
					oTable.addAggregation("rows", toto);		
						} catch (err) {
						    console.log(err);
						}
						
						
                        //oTable.addRow(toto);
            }, this);
 			
 			this.getModel().updateBindings();

}
			this.getModel("uploadView").setProperty("/busy", false);
			//	var contents = event.target.result;
			//	var myTable = contents.split("\n");
            
		}

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

	});

});