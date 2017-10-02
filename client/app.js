(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngCookies','ngFileUpload','toastr','ngCookies'])
        .factory('userProvider', function() {
           console.log("factory");
        })
        .config(config)
        .run(run);

    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
        $routeProvider
            .when('/admin', {
                controller: 'AdminController',
                templateUrl: 'admin/admin.view.html',
                controllerAs: 'vm',
                resolve: {
                  "myAdmin": function( $q, $timeout,UserService,$location ) {
                    var myFriend = $q.defer();        
                    if(UserService.getUser().id && UserService.getUser().role == 'admin'){
                        console.log('have id admin');
                        myFriend.resolve();
                    }else{
                        myFriend.reject();
                        $location.path('/login');
                    }
                    return myFriend.promise;
                  }
                }
            })
	        .when('/', {
                controller: 'MainController',
                templateUrl: 'main/main.html',
            })
            .when('/login', {
                controller: 'LoginController',
                templateUrl: 'login/login.view.html',
                controllerAs: 'vm',
                resolve: {
                  "myLogin": function( $q, $timeout,UserService,$location ) {
                    var myFriend = $q.defer();        
                    if(UserService.getUser().id && UserService.getUser().role == 'admin'){
                        console.log('have id admin');
                        myFriend.reject();
                        $location.path('/profile');
                    }else if(UserService.getUser().id){
                        console.log('have id');
                        myFriend.reject();
                        $location.path('/profile');
                    }else{
                        myFriend.resolve();
                    }
                    return myFriend.promise;
                  }
                }
            })
            .when('/add-profile',{
                controller: 'AddnewController',
               templateUrl: 'add-profile/addnew.view.html',
               controllerAs: 'vm'
            })
            .when('/verification',{
               controller: 'VerifyController',
               templateUrl: 'login/verify.html',
            })
            .when('/profile', {
                controller: 'ProfileController',
                templateUrl: 'profile/profile.html',
                resolve: {
                  "myProfile": function( $q, $timeout,UserService,$location ) {
                    var myFriend = $q.defer();        
                    if(UserService.getUser().id){
                        console.log('have id');
                        myFriend.resolve();
                    }else{
                        console.log('have no id');
                        myFriend.reject();
                        $location.path('/login');
                    }
                    return myFriend.promise;
                  }
                }
            })
            .otherwise({ redirectTo: '/' });
    }

    run.$inject = ['$rootScope','UserService','$q','$cookies'];
    function run($rootScope, UserService,$q,$cookies) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookies.getObject('globals') || {user:{}};
        window.root = $rootScope;
    }

})();
