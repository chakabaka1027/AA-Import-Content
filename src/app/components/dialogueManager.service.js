(function(){
	'use strict';
	
	angular.module('importContent')
	.service('dialogueService', dialogContentService);

	// how to use it
	// service.getDialogs("LinearMike");

	/** @ngInject */
	function dialogContentService($log, $http, $q, parseAAContentService){
		var dialogWorksheetKeys = {};

		var service = {
			getDialogs: getDialogs,
			dialogWorksheetKeys: dialogWorksheetKeys
		};

		var dialogJsonPaths = {
			// Charlie
			charlie_01: "assets/json/CC.STwGr.01.json",
			charlie_02: "assets/json/CC.RQwGR.02.json", 
			// Fran
			fran_Linear:"assets/json/FF.Linear.json",
			// fran_Linear_02:"assets/json/FF.Linear.02.json",
			fran_GR_01:"assets/json/FF.GR.01.json",
			fran_GR_02:"assets/json/FF.GR.02.json",
			fran_SmallTk_01:"assets/json/FF.ST.01.json",
			fran_SmallTk_02:"assets/json/FF.ST.02.json",
			fran_RQ_01:"assets/json/FF.RQ.01.json",
			fran_RQ_02:"assets/json/FF.RQ.02.json", 
			// Luna
			luna_01: "assets/json/LL.STwGr.01.json",
			luna_02: "assets/json/LL.STwGR.02.json", 
			// Mike
			mike_Linear:"assets/json/MM.Linear.json",
			mike_GR_01:"assets/json/MM.GR.01.json",
			mike_GR_02:"assets/json/MM.GR.02.json",
			mike_SmallTk_01:"assets/json/MM.ST.01.json",
			mike_SmallTk_02:"assets/json/MM.ST.02.json",
			mike_RQ_01:"assets/json/MM.RQ.01.json",
			mike_RQ_02:"assets/json/MM.RQ.02.json"
		};

		// so we can work with the data loaded via spreadsheet...
		for (var dialogKey in dialogJsonPaths) {
			var p = dialogJsonPaths[dialogKey].split('/');
			var jfn = p[p.length-1];
			var worksheetKey = jfn.replace('.json', '');
			dialogWorksheetKeys[dialogKey] = worksheetKey;
		}

		return service;

		function getDialogs(dialogKey){

			var spreadsheetContent = parseAAContentService.parsedContent[dialogWorksheetKeys[dialogKey]];
			if (spreadsheetContent) {
				// it's been loaded from a spreadsheet...
				var deferred = $q.defer();
				deferred.resolve(spreadsheetContent);
				return deferred.promise;
			}

			return $http.get(dialogJsonPaths[dialogKey]).then(function(response){
				return response.data;
			});
		};
	}
})();