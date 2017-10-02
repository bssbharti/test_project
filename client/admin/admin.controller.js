(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', HomeController);

    HomeController.$inject = ['UserService', '$rootScope','AuthenticationService','$location','$http'];
    function HomeController(UserService, $rootScope,AuthenticationService,$location,$http) {
        var vm = this;
        vm.user = null;
        vm.allUsers = [];
        vm.deleteUser = deleteUser;
	vm.logout = logout;
        vm.addNew = addNew;
        function addNew(){
            $location.path('/add-profile');
        }
	function logout() {
            UserService.logoutUser();
            $location.path('/login');
        }
        function deleteUser(id) {
            UserService.Delete(id)
            .then(function () {
                loadAllUsers();
            });
        }
    }

})();
