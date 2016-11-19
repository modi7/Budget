sap.ui.define([
	"budget/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("budget.controller.App", {

		onInit: function() {
			var oViewModel,
				fnSetAppNotBusy,
				iYear  = 2008, 
				aYears = [],
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

var aMonths=[ {id: 1, description:"Janvier"},
			  {id: 2, description:"Février"},
			  {id: 3, description:"Mars"},
			  {id: 4, description:"Avril"},
			  {id: 5, description:"Mai"},
			  {id: 6, description:"Juin"},
			  {id: 7, description:"Juillet"},
			  {id: 8, description:"Août"},
			  {id: 9, description:"Septembre"},
			  {id: 10, description:"Octobre"},
			  {id: 11, description:"Novembre"},
			  {id: 12, description:"Décembre"}];

for(var i = iYear; i <= new Date().getFullYear(); i++ ){
	
	aYears.push({id: i, description:i}  );
	
}



			oViewModel = new JSONModel({
				busy: true,
				delay: 0,
				months: aMonths,
				years: aYears
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().setUseBatch(false);
			// apply content density mode to root view
			this.getView().addStyleClass("sapUiSizeCompact");
		}
	});

});