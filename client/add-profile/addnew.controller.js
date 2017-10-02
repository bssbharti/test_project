(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddnewController', AddnewController);

    AddnewController.$inject = ['$scope','$timeout','Upload','$filter','$http','$location','AuthenticationService'];
        function AddnewController($scope,$timeout,Upload,$filter,$http,$location,AuthenticationService) {
          $scope.primary_img = 0;
          $scope.bugAttachments = [];
          $scope.profile = {height:48};
          $scope.addUser = function(){
            if($scope.profileForm.$valid){
                    $scope.profile.dob = $('#dob').val();
                    $scope.profile.tob = $('#tob').val();
                    $scope.profile.primary_img = $scope.primary_img;
                  Upload.upload({
                      url: '/api/upload',
                      file:$scope.bugAttachments,
                      headers: {'Content-Type': 'multipart/form-data'},
                      data: {profile:angular.toJson($scope.profile),attachCount:$scope.bugAttachments.length}
                  }).then(function (resp) {
                      
                      if(resp && resp.data && !resp.data.error){
                          $scope.profile = {height:48};
                          $scope.bugAttachments = [];
                          $scope.success = true;
                          $scope.error = false;
                      }else{
                              $scope.success = false;
                              $scope.error = 'Error in inserting data';
                      }
                  }, function (resp) {
                      console.log('err',resp);
                      $scope.success = false;
                      $scope.error = 'Error in inserting data';
                  });
            }else{
                $scope.success = false;
                $scope.error = 'Please check all the filled data again.';
            }
          }
          $scope.fileAdded =function(files){
            $scope.bugAttachments = $scope.bugAttachments.concat(files);
          }
          $scope.getFileSize = function(size) {
            if(size){
              var i = Math.floor( Math.log(size) / Math.log(1024) );
              return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
            }
          };

          $scope.logout = function(){
                $http.get('/logout')
                .then(function () {
                    $location.path('/login');
                });
                AuthenticationService.ClearCredentials();
          };

          $scope.gohome = function(){
                $location.path('/admin');
          };

          $scope.getExtension = function(name){
            if(name){
              return name.split('.')[name.split('.').length-1];
            }
          }
          $scope.removeAttachment = function(index){
            $scope.bugAttachments.splice(index,1);
          }
        }

})();
