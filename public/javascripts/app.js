
$('.user-role').change(function(){
  let role = $(this).val();
  let username = $(this).attr('user');
  $.post( "/users/edit", {'username': username, 'role': role}, function( result ) {
    location.reload();
  });
})

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
  // lib specific things
  $(".alert").alert();
  $('.dropdown-toggle').dropdown();
  $('[data-toggle="tooltip"]').tooltip()

  // pagination
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

  // app specific things
  $('#dashbordChart').click();
  $('#accountStatusReport').click()
  $(".commentDate").each(function() {
    $(this).text(ISOToDateFormat($(this).text(), 2));
  });

});
