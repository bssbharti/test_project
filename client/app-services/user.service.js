(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$http','AuthenticationService','$q','$cookies','$rootScope'];
    function UserService($http,AuthenticationService,$q,$cookies,$rootScope) {
        var service = {};
        window.service = service;

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.checkUser = checkUser;
        service.setUser = setUser;
        service.getUser = getUser;
        service.getLatestUser = getLatestUser;
        service.login = login;
        service.logoutUser = logoutUser;
        service.UpdateStep = UpdateStep;
        service.checkVerification = checkVerification;
        service.checkVerifed = checkVerifed;

        return service;

        function setUser(user){
            $rootScope.globals = {
                user: user.user
            };
            var cookieExp = new Date();
            cookieExp.setDate(cookieExp.getDate() + 7);
            $cookies.putObject('globals', $rootScope.globals, { expires: cookieExp });
        }

        function login(user){            
            return $http.post('/api/login', user).then(handleSuccess, handleError('Error login user'));
        }

        function logoutUser(){
            $rootScope.globals = {user:{}};
            $cookies.remove('globals');
            return $http.get('/api/logout').then(handleSuccess, handleError('Error logout user'));
        }

        function getUser(){
            return $rootScope.globals.user;
        }

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function checkVerifed(){
            return $http.get('/api/checkVerifed').then(handleSuccess, handleError('Error checking'));
        }

        function getLatestUser(){
            return $http.get('/api/getLatestUser').then(handleSuccess, handleError('Error getting latest'));
        }

        function GetById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByUsername(username) {console.log(username)
            return $http.get('/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError('Error creating user'));
        }

        function checkVerification(data){
            return $http.post('/api/verifyuser', data).then(handleSuccess, handleError('Error verifing user'));
        }

        function UpdateStep(user){
            return $http.post('/api/updateusers/'+ user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function checkUser(user) {
            return $http.post('/api/users/checkUser', user).then(handleSuccess, handleError('Error creating user'));
        }


        function Update(user) {
            return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
