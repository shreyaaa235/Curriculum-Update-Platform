// Smooth scroll when "Explore Features" is clicked
document.getElementById('getStartedBtn').addEventListener('click', function() {
  document.getElementById('uploadSection').scrollIntoView({ behavior: 'smooth' });
});

// Browse file click
document.getElementById('browseBtn').addEventListener('click', function() {
  document.getElementById('curriculumFile').click();
});

// Feedback form (demo response)
$('#feedbackForm').submit(function (event) {
  event.preventDefault();
  $('#feedbackResponse').html('<div class="alert alert-success">Thank you for your feedback!</div>');
});
