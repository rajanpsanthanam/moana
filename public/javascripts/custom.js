
function stageReport(account){
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


$( document ).ready(function() {
    $('#stageButton').click();
});
