var confirmationBox = function(title, endpoint){
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


var getRandomColor = function(){
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
