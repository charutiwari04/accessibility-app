var app = angular.module("restoApp", ["firebase", "ngRoute", "ngAria"]);
// Setup for rootscope.
app.run(['$location', '$rootScope', function($location, $rootScope){
	// stores uri for last page viewed - Used to track if we should set focus to main header.
	var history;
	// stores uri for current page viewed.
	var currentURL;
	$rootScope.$on('$routeChangeSuccess', function(event, current, previous){
		// Check for current root.
		if(current.$$route){
			//store current path
			currentURL = current.$$route.originalPath;
			//Set current page title.
			$rootScope.title = current.$$route.title;
		}
		// When navigating between pages track the last page we were on
		// to know if we should be setting focus on the header on view update.
		if(previous){
			if(previous.$$route){
				history = previous.$$route.originalPath;
			}
		}
	});
	$rootScope.$on('$viewContentLoaded', function(){
		// Once the template loads set focus to the header to manage focus
        // if there is no history do not adjust focus this is the first page the user is seeing
        if(history) {
            // Default - set page focus to header
            $('header').attr("tabIndex", -1).focus();
        }
	});
	$rootScope.sortBy = "";
	$rootScope.query = "";
}]);
// Controller "maincontroller" for main page.
app.controller("maincontroller", ['$scope', '$rootScope', '$firebaseObject', 'MyYelpAPI',function($scope, $rootScope, $firebaseObject, MyYelpAPI){
	var ref = new Firebase("https://r-review.firebaseio.com");
	$scope.businesses = [];
	$scope.categories = [];
	MyYelpAPI.retrieveYelp().then(function(data){
		$scope.businesses = data;
		$scope.sortBy = $rootScope.sortBy;
		$scope.query = $rootScope.query;
	});
	// Watch when sortBy field is updated and update global search variable
	$scope.$watch("sortBy", function(newValue, oldValue) {
		$rootScope.sortBy = $scope.sortBy;
    });
	// Watch when search field is updated and update global search variable
	$scope.$watch("query", function(newValue, oldValue) {
		$rootScope.query = $scope.query;
    });
// Controller "restodetailctlr" for restaurant detail page.
}]).controller("restodetailctlr", ['$scope', 'MyYelpAPI', '$routeParams', '$timeout', function($scope, MyYelpAPI, $routeParams, $timeout){
	$scope.getMessage = "";
	MyYelpAPI.retrieveYelp().then(function(data){
		$scope.obj={};
		$scope.businesses = data;
		for(var i=0; i<$scope.businesses.length;i++){
			if($scope.businesses[i].id === $routeParams.id){
				$scope.obj = $scope.businesses[i];
			}
		}
	});
	// function to handle form submit.
	$scope.submitRev = function(e){
		$scope.getMessage = "Review Submitted";
		var htmlToAdd = '<li>' +
						'<img src="http://s3-media3.fl.yelpcdn.com/photo/hk31BkJvJ8qcqoUvZ38rmQ/ms.jpg">'+
						'<h4>'+$scope.revName+'</h4>' +
						'<img src="https://s3-media1.fl.yelpcdn.com/assets/2/www/img/f1def11e4e79/ico/stars/v1/stars_5.png">'+
						'<p>'+$scope.review+'</p>' + '</li>';
		$('.resto-reviews ul').append(htmlToAdd);
		$scope.revName = '';
		$scope.review = '';
		$scope.form1.$setPristine();
		$scope.form1.$setUntouched();
		$('.check').modal('show');
		// set focus on close button.
		$('.check').on('shown.bs.modal', function () {
			$('.closeBtn').focus();
		});
	};
	// set focus on header of the page.
	$('.check').on('hidden.bs.modal', function () {
			$('header').attr("tabIndex",-1).focus();
	});
//Service to get data from file.
}]).factory("MyYelpAPI", function($http){
	return {
		"retrieveYelp": function(){
			return $http.get('data/restaurant-data.json').then(function(response){
				return response.data;
			});
		}
	}
// routing
}).config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'views/resto-list.html',
        controller: 'maincontroller',
		title: 'Restaurant Review Site'
      }).
      when('/:id', {
        templateUrl: 'views/resto-details.html',
        controller: 'restodetailctlr',
		title: 'Details of restaurant'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);