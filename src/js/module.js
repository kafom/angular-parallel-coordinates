var parallelCoordinateChart = require('parallel-coordinates-chart');
var throttle = require('lodash.throttle');

angular.module('parallelCoordinatesChart', [])
.directive('parallelCoordinatesChart', function parallelCoordinatesChart(){
  return {
    restrict: 'E',
    scope: {
      'values': '=',
      'select': '=',
      'config': '=',
      'highlight': '=',
      'filters': '=',
      'width': '@',
      'height': '@'
    },
    link: function($scope, $element, attrs){
      var chart = parallelCoordinateChart();
      var element = $element[0];
      var d3Element = d3.select(element);
      var data;

      // Prevent attempts to draw more than once a frame
      var throttledRedraw = throttle(chart.redraw, 16);

      function redraw(){
        if(!data) return;
        throttledRedraw(d3Element);
      }

      $element.on('changefilter', function(e){
        if(angular.equals($scope.filters, e.detail.filters)) return;
        
        $scope.$apply(function(){
          $scope.filters = e.detail.filters;
        });
      });

      $scope.$watch('filters', function(value){
        chart.filters(value || {});
      });

      $element.on('changehighlight', function(e){
        if($scope.highlight === e.detail.highlight) return;

        $scope.$apply(function(){
          $scope.highlight = e.detail.highlight;
        });
      });

      $scope.$watch('highlight', function(value){
        chart.highlight(value || '');
        redraw();
      });

      $scope.$watch(attrs.select, function(value){
        if(value === undefined) return;
        chart.dimensions(value);
        redraw();
      });

      attrs.$observe('width', function(value){
        if(!value && value !== 0) return;
        chart.width(value);
        redraw();
      });

      attrs.$observe('height', function(value){
        if(!value && value !== 0) return;
        chart.height(value);
        redraw();
      });

      $scope.$watch(attrs.config, function(value){
        if(!value) return;
        
        Object.keys(value).forEach(function(key){
          chart[key](value[key]);
        });
      });

      $scope.$watch('values', function(values){
        if(!values) return;
        data = values;
        d3Element.datum(data).call(chart.draw);
      });
    }
  };
});