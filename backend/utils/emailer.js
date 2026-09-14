async function sendEmail(to, subject, body) {
  console.log('--- EMAIL ---');
  console.log('to:', to);
  console.log('subject:', subject);
  console.log(body);
  console.log('-------------');
  return true;
}

module.exports = { sendEmail };
