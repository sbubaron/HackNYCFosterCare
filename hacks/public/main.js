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

$('.deleteTask').click(function () {

    console.log(this);
    var data = $.parseJSON($(this).attr('data-button'));
    
    var id = data.id;
    console.log(id); 
    fetch('/tasks/delete/by-id/', {
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
      window.location.reload(true)
    })
});

$('.viewTaskItem').click(function () {

    console.log(this);
    var data = $.parseJSON($(this).attr('data-button'));
    
    var id = data.id;
    console.log(id); 
    fetch('/taskitems/by-id/' + id + '/json', {
      method: 'get',
      headers: {'Content-Type': 'application/json'}
      
    }).then(res => {
      if (res.ok) {
        return res.json()
      }
    })
    .then(data => {
      console.log(data);
      console.log(data.taskItem[0]);
      $('#name').val(data.taskItem[0].name);
      $('#index').val(data.taskItem[0].index);
      $('#message').val(data.taskItem[0].message);
      $('#expectedInput').val(data.taskItem[0].expectedInput);
      $('#type').val(data.taskItem[0].type);
      $('#_id').val(data.taskItem[0]._id);
      
    })
});


$('.deleteTaskItem').click(function () {

    console.log(this);
    var data = $.parseJSON($(this).attr('data-button'));
    
    var id = data.id;
    console.log(id); 
    fetch('/taskitems/delete/by-id/', {
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
      window.location.reload(true)
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
