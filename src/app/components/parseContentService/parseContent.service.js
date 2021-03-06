(function() {
	'use strict';

	angular.module('importContent')
		.service('parseAAContentService', parseAAContentService);

	/** @ngInject */
	function parseAAContentService($log, xlsxService) {

		var service = {
			parsedContent: {},

			parseContentFromUrl: parseContentFromUrl,
			parseContentFromFile: parseContentFromFile,

			// mostly internal; exposed for testing...
			parseAllSheets: parseAllSheets,
			parseSheet: parseSheet,
			findSectionHeaders: findSectionHeaders

		};

		return service;

		function findSectionHeaders(sheet) {
			var hdrIndexes = [];
			var numRows = xlsxService.findSheetSize(sheet).r;

			for (var r=0; r<numRows; r++) {
				if ( (''+xlsxService.cellValue(sheet, 0,r)).toLowerCase() === 'annie') {
					hdrIndexes.push(r);
				}
			}
			return hdrIndexes;
		}

		function utfClean(s) {
			return s.trim();
		}

		function createBlock(row, col, code) {
			/*
			the data is always organized in groups of 5 in a row, starting at some index. Not all 5 cells are used; some data is skipped.
			*/
			var d = {
				'code': code,
				'PC_Text': utfClean(row[col]),
				'NPC_Response': utfClean(row[col+2]),
				'animation': row[4].toLowerCase()
			};
			return d;
		}

		function parseSheet(sheet) {

			var hdrIndexes = findSectionHeaders(sheet);

			if (hdrIndexes.length !== 1 && hdrIndexes.length !== 3) {
				return null;
			}

			var parsed = {};
			var row, i, j, code;
			var hdrIndex, hdrOffset;
			var choice1, choice2;

			if (hdrIndexes.length===1) {
				// it's a 'linear' exchange...
				row = sheetRow(hdrIndexes[0]+1);
				for (i=0, code='C'; i<4; i++, code += 'C') {
					parsed['node'+(i+1)] = [createBlock(row, 5*i, code)];
				}
				return parsed;
			}

			// it's not 'linear', so (hopefully!) it fits the following ad-hoc pattern...

			parsed['node1'] = [
				createBlock(sheetRow(hdrIndexes[0]+1), 0, 'A'),
				createBlock(sheetRow(hdrIndexes[1]+1), 0, 'B'),
				createBlock(sheetRow(hdrIndexes[2]+1), 0, 'C')
			];

			var node2 = {};
			for (i=0; i<3; i++) {
				hdrIndex = hdrIndexes[i];
				choice1 = 'ABC'[i];
				node2[choice1] = [
					createBlock(sheetRow(hdrIndex+1), 5, choice1+'A'),
					createBlock(sheetRow(hdrIndex+5), 5, choice1+'B'),
					createBlock(sheetRow(hdrIndex+9), 5, choice1+'C')
				];
			}
			parsed['node2'] = node2

			var node3 = {};
			for (i=0; i<3; i++) {
				hdrIndex = hdrIndexes[i];
				choice1 = 'ABC'[i];
				for (j=0; j<3; j++) {
					hdrOffset = [0,4,8][j];
					choice2 = 'ABC'[j];
					var pfx = choice1+choice2
					var rowOffset = hdrIndex+hdrOffset
					node3[pfx] = [
						createBlock(sheetRow(rowOffset+1), 10, pfx+'A'),
						createBlock(sheetRow(rowOffset+2), 10, pfx+'B'),
						createBlock(sheetRow(rowOffset+3), 10, pfx+'C')
					];
				}
			}
			parsed['node3'] = node3;

			return parsed;

			// because I'm lazy and don't want to type that much... :)
			function sheetRow(rowIx) {
				return xlsxService.sheetRow(sheet, rowIx);
			}

		}

		function parseAllSheets(book) {
			var parsed = {};
			var sheetNames = book.SheetNames;
			sheetNames.forEach(function(sheetName) {
				if (sheetName !== 'Template') {
					var sheet = book.Sheets[sheetName];
					var sheetParsed = parseSheet(sheet);
					if (sheetParsed) {
						parsed[sheetName] = sheetParsed;
						$log.log(sheetName);
					} else {
						$log.warn(sheetName+': unparseable');
					}
				} else {
					$log.log(sheetName+': skipping');
				}
			});

			return parsed;
		}

		function parseContentFromUrl(url) {
			return xlsxService.loadWorkbookFromUrl(url)
				.then(function(book) {
					service.parsedContent = parseAllSheets(book);
					return service.parsedContent;
				});
		}

		function parseContentFromFile(fileObject) {
			return xlsxService.loadWorkbookFromFile(fileObject)
				.then(function(book) {
					service.parsedContent = parseAllSheets(book);
					return service.parsedContent;
				});
		}

	}

})();