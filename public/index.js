function subscribe(token) {
  var email = document.querySelector('.email-input').value;

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/subscribe', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Success message
        console.log('Subscription successful!');
      } else {
        // Error message
        console.error('Subscription failed. Please try again later.');
      }
    }
  };
  xhr.send(JSON.stringify({ email: email, token: token }));
}