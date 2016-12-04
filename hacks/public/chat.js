$('#sendSMS').click(function () {
  submitSMS()
});

function submitSMS() {
      console.log(this);
    //var data = $.parseJSON($(this).attr('data-button'));

    var msg = $('#inputSMS').val();
    var state = $('#inputState').val();
    var phone = $('#inputPhone').val();

    if(msg === undefined)
        msg = '';
    if(msg != '')
        $('#chatlog').append("<div class='chatbubble user'><strong class='name'>You:</strong> " + msg + "<br /></div>")

    //var id = data.id;
    console.log(msg); 
    fetch('/chat/', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'msg': msg,
        'phone': phone,
        state: state
      })
    }).then(res => {
      if (res.ok) return res.json()
    })
    .then(data => {
      console.log(data)
      if(data.message != '')
        $('#chatlog').append("<div class='chatbubble bot'><strong class='name'>Iris:</strong> " + data.message + "<br /></div>")
      //$('#chatlog').append("<strong>Current State </strong>" + data.state + "<br />")
      $('#inputSMS').val('');
      $('#inputState').val(data.state)

      if(data.repost === true) {
          console.log('reposting...');
          submitSMS();
      }
      //window.location.reload(true)
    })
}