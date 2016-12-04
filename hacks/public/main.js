$('.deleteProfile').click(function () {

    console.log(this);
    var data = $.parseJSON($(this).attr('data-button'));
    
    var id = data.id;
    console.log(id); 
    fetch('/profiles/delete/by-id', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'id': id
      })
    }).then(res => {
      if (res.ok) return res.json()
    })
    .then(data => {
      console.log(data)
      //window.location.reload(true)
    })
});


$('#updateProfile').click(function () {
    console.log(this);
    var data = $.parseJSON($(this).attr('data-button'));
    var name = $('#name').val();
    var cellphone = $('#cellphone').val();
    var interests = $('#interests').val();
    var dob = $('#dob').val();
    
    var id = data.id;
     

    fetch('/profiles/update/by-id', {
    method: 'put',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      'id': id,
      'name': name,
      'dob': dob,
      'cellphone': cellphone,
      'interests': interests
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {
    window.location.reload(true)
  })

});
