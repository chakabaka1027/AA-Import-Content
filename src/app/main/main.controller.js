(function() {
    'use strict';

    angular
    .module('importContent')
    .controller('MainController', MainController);

    /** @ngInject */
    function MainController($scope, $log, xlsxService, parseAAContentService, dialogueService) {
        var vm = this;

        vm.fileList = null;
        vm.loadFromServer = loadFromServer;
        vm.loadFromFile = loadFromFile;
        vm.testGetDialog = testGetDialog;

        vm.status = "No content loaded";

        $log.log(xlsxService.encodeCR(155,11));
        $log.log(xlsxService.decodeCR(xlsxService.encodeCR(155,11)));

        $log.log(dialogueService.dialogWorksheetKeys);



        $scope.$watch(function() {return vm.fileList;}, function() {
            $log.log(vm.fileList);
            if (vm.fileList && vm.fileList.length>0) {

                vm.status = "Loading from file '"+vm.fileList[0].name+"' ...";

                parseAAContentService.parseContentFromFile(vm.fileList[0])
                    .then(function(parsedContent) {
                        vm.status = "Loaded from file '"+vm.fileList[0].name+"'.";
                        $log.log('Success!');
                        $log.log(parsedContent);
                        vm.fileList = null;
                    });
            }
        });

        function loadFromFile(fileObject) {

            vm.status = "Loading from file '"+fileObject.name+"' ...";

            parseAAContentService.parseContentFromFile(fileObject)
                .then(function(parsedContent) {
                    vm.status = "Loaded from file '"+fileObject.name+"'.";
                    $log.log('Success!');
                    $log.log(parsedContent);
                });
        }

        function loadFromServer() {
            var url = 'assets/Awkward Annie sequencing_v13_08_09_16_v2.xlsx';

            vm.status = "Loading from url '"+url+"' ...";

            parseAAContentService.parseContentFromUrl(url)
                .then(function(parsedContent) {
                    vm.status = "Loaded from url '"+url+"'.";
                    $log.log('Success!');
                    $log.log(parsedContent);
                });

        }

        function testGetDialog(dialogKey) {
            dialogueService.getDialogs('charlie_01')
                .then(function(data) {
                    $log.log('success!');
                    $log.log(data);
                })
                .catch(function(result) {
                    $log.log('failure!');
                    $log.log(result);
                });
        }

    }

})();
