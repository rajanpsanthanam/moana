function accountStagePieReport(){
  $.get( "/reports/accounts/stage", function( analytics ) {
    analytics = JSON.parse(analytics);
    var option = {
        type: 'pie',
        data: {
            labels: analytics.labels,
            datasets: [{
                label: '# of accounts per stage',
                data: analytics.data,
                backgroundColor: analytics.background_color,
                borderColor: analytics.border_color,
                borderWidth: 1
            }]
        }
    };
    var myChart = new Chart($('#stageChart'), option);
  });
};


function accountFeaturePieReport(){
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


function accountStatePieReport(){
  $.get( "/reports/accounts/state", function( analytics ) {
    analytics = JSON.parse(analytics);
    var option = {
        type: 'doughnut',
        data: {
            labels: analytics.labels,
            datasets: [{
                label: '# of accounts per state',
                data: analytics.data,
                backgroundColor: analytics.background_color,
                borderColor: analytics.border_color,
                borderWidth: 1
            }]
        }
    };
    var myChart = new Chart($('#stateChart'), option);
  });
};


function stageBarReport(account){
  $.get( "/reports/accounts/"+ account +"/stage", function( analytics ) {
    analytics = JSON.parse(analytics);
    var myChart = new Chart($('#stageBarChart'), {
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

var ISOToDateFormat = function(dateString, limit){
  dateString=new Date(dateString).toLocaleString();
  dateString=dateString.split(',').slice(0, limit).join(' ');
  return dateString;
 }

 function dashbordChart(){
   accountStatePieReport();
   accountStagePieReport();
   accountFeaturePieReport();
 }


$( document ).ready(function() {
    $(".alert").alert();
    $('.dropdown-toggle').dropdown();
    $('[data-toggle="tooltip"]').tooltip()
    $('#dashbordChart').click();
    $('#stageButton').click();
    $("#accSignupDate").text(ISOToDateFormat($('#accSignupDate').text(), 1));
    $("#accProcessStartDate").text(ISOToDateFormat($('#accProcessStartDate').text(), 1));
    $("#accExpectedCompletionDate").text(ISOToDateFormat($('#accExpectedCompletionDate').text(), 1));
    $("#accActualCompletionDate").text(ISOToDateFormat($('#accActualCompletionDate').text(), 1));
    $(".commentDate").each(function() {
      $(this).text(ISOToDateFormat($(this).text(), 2));
    });
});
