var app = angular.module("restoApp", ["ngRoute", "ngAria"]);
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
app.controller("maincontroller", ['$scope', '$rootScope', 'mydata', function($scope, $rootScope, mydata){
	$scope.businesses = [];
	$scope.categories = [];
	mydata.retrieveYelp().then(function(data){
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
}]);
app.controller("restodetailctlr", ['$scope', 'mydata', '$routeParams', function($scope, mydata, $routeParams){
	$scope.getMessage = "";
	var rateMsg = ["Terrible", "Poor", "Average", "Very Good", "Excellent"];
	mydata.retrieveYelp().then(function(data){
		$scope.obj={};
		$scope.businesses = data;
		for(var i=0; i<$scope.businesses.length;i++){
			if($scope.businesses[i].id === $routeParams.id){
				$scope.obj = $scope.businesses[i];
			}
		}
	});
	// event handler functions to handle star ratings.
	function focusHandler(){
		if($('#your-rating span').hasClass('selected')){return;}
		var indx = $('#your-rating span').index(this);
		for(var i= 0; i<=indx; i++){
			$('#your-rating span img').eq(i).attr('src', "imgs/14x14_3.png");
		}
	}
	function blurHandler(){
		if($('#your-rating span').hasClass('selected')){return;}
		var indx = $('#your-rating span').index(this);
		for(var i= 0; i<=indx; i++){
			$('#your-rating span img').eq(i).attr('src', "imgs/14x14_0.png");
		}
	}
	$('#your-rating span').focus(focusHandler);
	$('#your-rating span').mouseover(focusHandler);
	$('#your-rating span').blur(blurHandler);
	$('#your-rating span').mouseout(blurHandler);
	var first = true;
	function handlerFunction(e){
		if((e.which === 13) || (e.which === 1)){
		if(first){
			var indx = $('#your-rating span').index(this);
			$('#your-rating span').addClass('selected');
			for(var i= 0; i<=indx; i++){
				$('#your-rating span img').eq(i).attr('src', "imgs/14x14_3.png");
			}
			switch(indx){
				case 0:
					$scope.star1 = true;
					break;
				case 1:
					$scope.star2 = true;
					break;
				case 2:
					$scope.star3 = true;
					break;
				case 3:
					$scope.star4 = true;
					break;
				case 4:
					$scope.star5 = true;
					break;
			}
		}
		else{
			$('#your-rating span').removeClass('selected');
			for(var i= 0; i<=4; i++){
				$('#your-rating span img').eq(i).attr('src', "imgs/14x14_0.png");
			}
		}
		first = !first;
		}
	};
	$('#your-rating span').click(handlerFunction);
	$('#your-rating span').keydown(handlerFunction);
	// function to handle form submit.
	$scope.submitRev = function(e){
		var srcUrl = "";
		var srcUsr = "";
		$scope.getMessage = "Review Submitted";
		if($scope.star1){
			srcUrl="https://s3-media1.fl.yelpcdn.com/assets/2/www/img/f64056afac01/ico/stars/v1/stars_1.png";
			srcUsr="imgs/usr1.jpg";
		}
		if($scope.star2){
			srcUrl="https://s3-media2.fl.yelpcdn.com/assets/2/www/img/b561c24f8341/ico/stars/v1/stars_2.png";
			srcUsr="imgs/usr2.jpg";
		}
		if($scope.star3){
			srcUrl="https://s3-media3.fl.yelpcdn.com/assets/2/www/img/34bc8086841c/ico/stars/v1/stars_3.png";
			srcUsr="imgs/usr1.jpg";
		}
		if($scope.star4){
			srcUrl="http://s3-media4.fl.yelpcdn.com/assets/2/www/img/c2f3dd9799a5/ico/stars/v1/stars_4.png";
			srcUsr="http://s3-media3.fl.yelpcdn.com/photo/hk31BkJvJ8qcqoUvZ38rmQ/ms.jpg";
		}
		if($scope.star5){
			srcUrl="https://s3-media1.fl.yelpcdn.com/assets/2/www/img/f1def11e4e79/ico/stars/v1/stars_5.png";
			srcUsr = "http://s3-media3.fl.yelpcdn.com/photo/e2cUD11T3u54V5qgpsDJCA/ms.jpg";
		}
		var d = new Date();
		var n = d.toUTCString();
		n = n.substr(5, 11);
		var htmlToAdd = '<li>' +
						'<img class="userPhoto" src='+srcUsr+'>'+
						'<h4>'+$scope.revName+'</h4>' +
						'<img src='+srcUrl+'>'+
						'<span> Reviewed '+n+'</span>'+
						'<p>'+$scope.review+'</p>' + '</li>';
		$('.resto-reviews ul').append(htmlToAdd);
		$scope.revName = '';
		$scope.review = '';
		$('#your-rating span img').attr('src', "imgs/14x14_0.png");
		$('#your-rating span').removeClass('selected');
		$scope.star1=false;
		$scope.star2=false;
		$scope.star3=false;
		$scope.star4=false;
		$scope.star5=false;
		first = true;
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
}]);
app.factory("mydata", ['$timeout', '$http', function($timeout, $http){
	var myData =  {
		"retrieveYelp": function(callback){
			return $timeout(function(){
				return $http.get('data/restaurant-data.json').then(function(response){
					return response.data;
				});
			}, 30);
		}
	};
	return myData;
}]);
app.config(['$routeProvider',
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