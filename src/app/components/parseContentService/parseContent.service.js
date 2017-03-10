(function() {
	'use strict';

	angular.module('importContent')
		.service('parseAAContentService', parseAAContentService);

	/** @ngInject */
	function parseAAContentService($log) {
		var service = {
			parseAllSheets: parseAllSheets,
			parseSheet: parseSheet,
			findSheetSize: findSheetSize,
			findSectionHeaders: findSectionHeaders
		};

		var reParseCR = /([A-Z]+)([0-9]+)/;

		return service;

		function decodeCR(crKey) {
			var m = reParseCR.exec(crKey);
			var cc = m[1], rc = m[2];
			var c = 0;
			for (var i = 0; i<cc.length; i++) {
				c = 26*c + cc.charCodeAt(i) - 65;
			}

			return {c:c, r:(rc*1)-1};
		}

		function encodeCR(c,r) {
			var cc = '';
			cc = String.fromCharCode(65+c);
			return cc+(r+1);
		}

		function cellValue(sheet, c, r) {
			var cell = sheet[encodeCR(c,r)];
			return (angular.isUndefined(cell) ? '' : cell.v);
		}

		function findSheetSize(sheet) {
			var sheetSize = {r:0, c:0};

			for (var crKey in sheet) {
				if (crKey[0]==='!') continue;
				var cr = decodeCR(crKey);
				sheetSize.c = Math.max(sheetSize.c, cr.c+1);
				sheetSize.r = Math.max(sheetSize.r, cr.r+1);
			}

			return sheetSize;
		}

		function sheetRow(sheet, r) {
			var numCols = findSheetSize(sheet).c;
			var row = [];
			for (var c=0; c<numCols; c++) {
				row.push(cellValue(sheet, c, r));
			}
			return row;
		}

		function findSectionHeaders(sheet) {
			var hdrIndexes = [];
			var numRows = findSheetSize(sheet).r;

			for (var r=0; r<numRows; r++) {
				if ( (''+cellValue(sheet, 0,r)).toLowerCase() === 'annie') {
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
				row = sheetRow(sheet, hdrIndexes[0]+1);
				for (i=0, code='C'; i<4; i++, code += 'C') {
					parsed['node'+(i+1)] = [createBlock(row, 5*i, code)];
				}
				return parsed;
			}

			// it's not 'linear', so (hopefully!) it fits the following ad-hoc pattern...

			parsed['node1'] = [
				createBlock(sheetRow(sheet, hdrIndexes[0]+1), 0, 'A'),
				createBlock(sheetRow(sheet, hdrIndexes[1]+1), 0, 'B'),
				createBlock(sheetRow(sheet, hdrIndexes[2]+1), 0, 'C')
			];

			var node2 = {};
			for (i=0; i<3; i++) {
				hdrIndex = hdrIndexes[i];
				choice1 = 'ABC'[i];
				node2[choice1] = [
					createBlock(sheetRow(sheet, hdrIndex+1), 5, choice1+'A'),
					createBlock(sheetRow(sheet, hdrIndex+5), 5, choice1+'B'),
					createBlock(sheetRow(sheet, hdrIndex+9), 5, choice1+'C')
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
						createBlock(sheetRow(sheet, rowOffset+1), 10, pfx+'A'),
						createBlock(sheetRow(sheet, rowOffset+2), 10, pfx+'B'),
						createBlock(sheetRow(sheet, rowOffset+3), 10, pfx+'C')
					];
				}
			}
			parsed['node3'] = node3

			return parsed

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
						$log.log(sheetName+': unparseable');
					}
				} else {
					$log.log(sheetName+': skipping');
				}
			});

			return parsed;
		}

	}

})();