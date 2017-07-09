
var accountFeaturePieReport = function(){
  $.get( "/reports/accounts/feature", function( analytics ) {
    analytics = JSON.parse(analytics);
    var option = {
        type: 'pie',
        data: {
            labels: analytics.labels,
            datasets: [{
                label: '# of accounts per feature',
                data: analytics.data,
                backgroundColor: analytics.background_color,
                borderColor: analytics.border_color,
                borderWidth: 1
            }]
        }
    };
    var myChart = new Chart($('#featureChart'), option);
  });
};


var accountUserPieReport = function(){
  $.get( "/reports/accounts/user", function( analytics ) {
    analytics = JSON.parse(analytics);
    var backgroundColor = [];
    var borderColor = [];
    for(i=0; i<analytics.labels.length; i++){
      let color = getRandomColor();
      backgroundColor.push(color);
      borderColor.push(color);
    }
    var option = {
        type: 'polarArea',
        data: {
            labels: analytics.labels,
            datasets: [{
                label: '# of accounts per user',
                data: analytics.data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        }
    };
    var myChart = new Chart($('#userChart'), option);
  });
};


var featureStatusReport = function(account, feature){
  $.get( "/reports/account/"+ account +"/feature/"+ feature +"/stage-data", function( analytics ) {
    analytics = JSON.parse(analytics);
    var myChart = new Chart($('#'+feature), {
        type: 'bar',
        data: {
            labels: analytics.labels,
            datasets: [{
                label: '# of days spent per stage',
                data: analytics.data,
                backgroundColor: analytics.background_color,
                borderColor: analytics.border_color,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
  });
};
