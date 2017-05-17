$('.user-role').change(function(){
  let role = $(this).val();
  let username = $(this).attr('user');
  $.post( "/users/edit", {'username': username, 'role': role}, function( result ) {
    location.reload();
  });
})

function restoreFeature(name){
  $.confirm({
    title: 'Restore!',
    content: 'Are you sure want to restore '+name+'?' ,
    buttons: {
        confirm: function () {
          $.get( "/features/restore/"+name, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}

function deleteFeature(name){
  $.confirm({
    title: 'Delete!',
    content: 'Are you sure want to delete '+name+'?' ,
    buttons: {
        confirm: function () {
          $.get( "/features/remove/"+name, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}

function restoreStage(name){
  $.confirm({
    title: 'Restore!',
    content: 'Are you sure want to restore '+name+'?' ,
    buttons: {
        confirm: function () {
          $.get( "/stages/restore/"+name, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}

function deleteStage(name){
  $.confirm({
    title: 'Delete!',
    content: 'Are you sure want to delete '+name+'?' ,
    buttons: {
        confirm: function () {
          $.get( "/stages/remove/"+name, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}

function restoreUser(username){
  $.confirm({
    title: 'Restore!',
    content: 'Are you sure want to restore '+username+'?' ,
    buttons: {
        confirm: function () {
          $.get( "/users/restore/"+username, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}

function deleteUser(username){
  $.confirm({
    title: 'Delete!',
    content: 'Are you sure want to delete '+username+'?' ,
    buttons: {
        confirm: function () {
          $.get( "/users/remove/"+username, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}

function grantUser(username){
  $.confirm({
    title: 'Grant!',
    content: 'Are you sure want to grant admin access to '+username+'?',
    buttons: {
        confirm: function () {
          $.get( "/users/grant/"+username, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}


function revokeUser(username){
  $.confirm({
    title: 'Revoke!',
    content: 'Are you sure want to revoke admin access from '+username+'?',
    buttons: {
        confirm: function () {
          $.get( "/users/revoke/"+username, function(result) {
            location.reload();
          });
        },
        cancel: function () {
        }
    }
  });
}


function accountStagePieReport(){
  $.get( "/reports/accounts/stage", function( analytics ) {
    analytics = JSON.parse(analytics);
    var option = {
        type: 'bar',
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
   accountStatePieReport();
   accountStagePieReport();
   accountFeaturePieReport();
   accountUserPieReport();
 }


$( document ).ready(function() {
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
    $('#stageButton').click();
    $("#accSignupDate").text(ISOToDateFormat($('#accSignupDate').text(), 1));
    $("#accProcessStartDate").text(ISOToDateFormat($('#accProcessStartDate').text(), 1));
    $("#accExpectedCompletionDate").text(ISOToDateFormat($('#accExpectedCompletionDate').text(), 1));
    $("#accActualCompletionDate").text(ISOToDateFormat($('#accActualCompletionDate').text(), 1));
    $(".commentDate").each(function() {
      $(this).text(ISOToDateFormat($(this).text(), 2));
    });
});
