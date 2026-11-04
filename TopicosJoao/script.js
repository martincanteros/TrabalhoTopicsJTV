const conversation = [];
const form = document.getElementById('form');
const input = document.getElementById('input');
const sendButton = document.getElementById('send');
const messages = document.getElementById('messages');
const welcome = document.getElementById('welcome');
const statusText = document.querySelector('.status');
const originalStatus = statusText.textContent;
let isWaitingForReply = false;

function appendMessage(text, isBot, extraClass = '') {
  const message = document.createElement('div');
  message.className = `msg ${isBot ? 'bot' : 'user'} ${extraClass}`.trim();

  if (isBot) {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    message.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  const time = document.createElement('span');
  time.className = 'time';
  time.textContent = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());
  bubble.appendChild(time);

  message.appendChild(bubble);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function setWaiting(waiting) {
  isWaitingForReply = waiting;
  input.disabled = waiting;
  sendButton.disabled = waiting || input.value.trim().length === 0;
  statusText.textContent = waiting ? 'Preparando uma resposta...' : originalStatus;

  const typing = document.getElementById('typing');
  if (typing) typing.remove();

  if (waiting) {
    const indicator = document.createElement('div');
    indicator.className = 'msg typing';
    indicator.id = 'typing';
    indicator.setAttribute('aria-label', 'A IA está respondendo');
    indicator.innerHTML = '<div class="avatar"></div><div class="bubble"><span></span><span></span><span></span></div>';
    messages.appendChild(indicator);
    messages.scrollTop = messages.scrollHeight;
  }
}

async function sendMessage(text) {
  const userText = text.trim();
  if (!userText || isWaitingForReply) return;

  welcome.hidden = true;
  appendMessage(userText, false);
  input.value = '';
  setWaiting(true);

  const pendingConversation = [
    ...conversation,
    { role: 'user', content: userText }
  ].slice(-20);

  try {
    const response = await fetch('chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: pendingConversation })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `A solicitação falhou (HTTP ${response.status}).`);
    }

    if (typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('A resposta recebida da IA está vazia ou inválida.');
    }

    conversation.push(
      { role: 'user', content: userText },
      { role: 'assistant', content: data.reply }
    );
    if (conversation.length > 20) {
      conversation.splice(0, conversation.length - 20);
    }
    appendMessage(data.reply, true);
  } catch (error) {
    console.error('Erro ao conversar com a IA:', error);
    appendMessage(
      ` Não consegui uma chave de graça professor, e as pagas estavam caras......`,
      true,
      'error'
    );
  } finally {
    setWaiting(false);
    input.focus();
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener('input', () => {
  sendButton.disabled = isWaitingForReply || input.value.trim().length === 0;
});

document.querySelectorAll('.suggestion').forEach(button => {
  button.addEventListener('click', () => sendMessage(button.textContent.trim()));
});

document.getElementById('newChat').addEventListener('click', () => {
  if (isWaitingForReply) return;
  conversation.length = 0;
  messages.querySelectorAll('.msg').forEach(message => message.remove());
  welcome.hidden = false;
  input.value = '';
  sendButton.disabled = true;
  input.focus();
});
