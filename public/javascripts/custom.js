function stagePieReport(account){
  $.get( "/accounts/analytics/"+ account +"/stage", function( analytics ) {
    analytics = JSON.parse(analytics);
    var analyticsData = analytics.data;
    var labels = analytics.labels;
    var backgroundColor = analytics.background_color;
    var borderColor = analytics.border_color;
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: '# of days spent per stage',
                data: analyticsData,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        }
    });
  });
};


function stageLineReport(account){
  $.get( "/accounts/analytics/"+ account +"/stage", function( analytics ) {
    analytics = JSON.parse(analytics);
    var analyticsData = analytics.data;
    var labels = analytics.labels;
    var backgroundColor = analytics.background_color;
    var borderColor = analytics.border_color;
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '# of days spent per stage',
                data: analyticsData,
                fill: false,
                lineTension: 0,
                borderWidth: 2,
                borderColor: '#d62d20'
            }]
        }
    });
  });
};

function stageBarReport(account){
  $.get( "/accounts/analytics/"+ account +"/stage", function( analytics ) {
    analytics = JSON.parse(analytics);
    var analyticsData = analytics.data;
    var labels = analytics.labels;
    var backgroundColor = analytics.background_color;
    var borderColor = analytics.border_color;
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '# of days spent per stage',
                data: analyticsData,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
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
  console.log(dateString);
  dateString=new Date(dateString).toLocaleString();
  dateString=dateString.split(',').slice(0, limit).join(' ');
  return dateString;
 }


$( document ).ready(function() {
    $('#stageButton').click();
    $("#accSignupDate").text(ISOToDateFormat($('#accSignupDate').text(), 1));
    $("#accProcessStartDate").text(ISOToDateFormat($('#accProcessStartDate').text(), 1));
    $("#accExpectedCompletionDate").text(ISOToDateFormat($('#accExpectedCompletionDate').text(), 1));
    $("#accActualCompletionDate").text(ISOToDateFormat($('#accActualCompletionDate').text(), 1));
    $(".commentDate").each(function() {
      $(this).text(ISOToDateFormat($(this).text(), 2));
    });
});
