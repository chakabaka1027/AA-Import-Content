(function() {
    'use strict';

    angular
    .module('importContent')
    .controller('MainController', MainController);

    /** @ngInject */
    function MainController($log, xlsxService, parseAAContentService) {
        var vm = this;

        var url = 'assets/Awkward Annie sequencing_v13_08_09_16_v2.xlsx';

        var book;

        /*
        xlsxService.loadWorkbookFromUrl(url)
            .then(function(bk) {
                book = bk;
                $log.log(book);

                $log.log(parseAAContentService.parseAllSheets(book));


            });
        */

        function handleFileLoad(e) {
            $log.log(e);            
        }

    }

})();
