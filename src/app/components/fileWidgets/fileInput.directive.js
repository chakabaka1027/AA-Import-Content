(function() {
	'use strict';

	angular.module('importContent')
		.directive('xlsxFile', xlsxFile);

	/** @ngInject */
	function xlsxFile($log) {
		return {
			restrict: 'A',
			scope: {
				xlsxFile: '='
			},
			link: link
		};

		function link(scope, elm, attrs) {
			$log.log(scope);
		}
	}
})();