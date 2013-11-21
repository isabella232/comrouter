$(function() {
  console.log('bää');

  function inform(err, res) {
    console.log(err, res);
    $('#response').hide();
    if (err) {
      $('#response').html(err).css('color', 'red').fadeIn();
    } else if (res) {
      $('#response').html(res).css('color', 'green').fadeIn();
    } else {
      $('#response').html('...').css('color', 'black').fadeIn();
    }
  }

  // send message
  $('#sendMessage').click(function(e) {

    // show loading
    inform();

    e.preventDefault();

    // get input values
    var from = $('#fromNumber').val();
    var to = $('#toNumber').val();
    var message = $('#message').val();
    var password = $('#password').val();

    // asynchronously post with superagent to server
    superagent
      .post('/messages/send')
      .type('json')
      .send({
        'from': from,
        'to': to,
        'password': password,
        'body': message
      })
      .end(function(err, res) {
        if (err) return inform(err);
        if (res && res.body && res.body.status == 400) return inform('✖ ' + res.body.message);
        inform(null, '✓ message sent! <br/> ' + res.text);
      });

    // // post with ajax to server
    // var jqxhr = $.post('/messages/send', {
    //     'from': from,
    //     'to': to,
    //     'body': message
    //   },
    //   function(err, data) {
    //     if (err) return inform(err);

    //     console.log('success', data);
    //     inform(null, data);
    //   })
    //   .fail(function() {
    //     console.log('error');
    //     inform('arrrr... something went wrong.');
    //   })

  })
})