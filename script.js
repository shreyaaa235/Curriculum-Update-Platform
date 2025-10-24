document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 1000, once: true });

  // Smooth scroll for Explore Features
  document.getElementById('getStartedBtn').addEventListener('click', () => {
    document.getElementById('uploadSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // File upload logic
  const dropArea = document.getElementById('dropArea');
  const uploadResponse = document.getElementById('uploadResponse');
  const browseBtn = document.getElementById('browseBtn');
  const fileInput = document.getElementById('curriculumFile');

  browseBtn.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    uploadResponse.innerHTML = `<div class="alert alert-info">File <b>${file.name}</b> ready to upload!</div>`;
  });

  // Feedback form
  $('#feedbackForm').submit(function (event) {
    event.preventDefault();
    $('#feedbackResponse').html('<div class="alert alert-success">Thank you for your feedback! 🌟</div>');
    this.reset();
  });

  // Chatbot logic
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbot = document.getElementById('chatbot');
  const chatbotBody = document.getElementById('chatbotBody');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');

  chatbotToggle.addEventListener('click', () => {
    chatbot.style.display = chatbot.style.display === 'flex' ? 'none' : 'flex';
  });

  function addMessage(text, sender = 'bot') {
    const msg = document.createElement('div');
    msg.classList.add('chatbot-message', sender === 'bot' ? 'bot-message' : 'user-message');
    msg.textContent = text;
    chatbotBody.appendChild(msg);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }

  function respondToUser(text) {
    let reply;
    text = text.toLowerCase();
    if (text.includes('upload')) reply = "You can upload your curriculum in the 'Upload Curriculum' section 📂.";
    else if (text.includes('feedback')) reply = "We’d love to hear your feedback in the form below 💬.";
    else if (text.includes('hello') || text.includes('hi')) reply = "Hello there 👋! How can I assist you today?";
    else reply = "I'm here to help with uploads, analytics, or feedback sections.";
    setTimeout(() => addMessage(reply, 'bot'), 600);
  }

  function sendMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatbotInput.value = '';
    respondToUser(text);
  }

  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
});
