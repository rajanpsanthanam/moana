function confirmationBox(title, endpoint){
  $.confirm({
    title: title,
    content: 'Are you sure want to perform the action',
    buttons: {
        confirm: function () {
          $.get( endpoint, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}

function featureStatusReport(account, feature){
  $('#feature-status').show();
  featureStatusBarChart(account);
}

$('.user-role').change(function(){
  let role = $(this).val();
  let username = $(this).attr('user');
  $.post( "/users/edit", {'username': username, 'role': role}, function( result ) {
    location.reload();
  });
})

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

function accountUserPieReport(){
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


function featureStatusReport(account, feature){
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


var getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


var ISOToDateFormat = function(dateString, limit){
  dateString=new Date(dateString).toLocaleString();
  dateString=dateString.split(',').slice(0, limit).join(' ');
  return dateString;
 }

 function dashbordChart(){
   accountFeaturePieReport();
   accountUserPieReport();
 }

 function accountStatusReport(account, features){
   var features = features.split(',');
   for(i=0;i<features.length;i++){
     featureStatusReport(account, features[i]);
   }
 }


$( document ).ready(function() {
    $("#commentsTable").hpaging({
      "limit": 10
    });
    $("#userTable").hpaging({
      "limit": 10
    });
    $("#accountTable").hpaging({
      "limit": 10
    });
    $("#stageTable").hpaging({
      "limit": 10
    });
    $("#featureTable").hpaging({
      "limit": 10
    });
    $(".alert").alert();
    $('.dropdown-toggle').dropdown();
    $('[data-toggle="tooltip"]').tooltip()
    $('#dashbordChart').click();
    $('#accountStatusReport').click()
    $(".commentDate").each(function() {
      $(this).text(ISOToDateFormat($(this).text(), 2));
    });
});
