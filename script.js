
const autoResponses = {
  "eu quero pedir algo": "Claro! Por favor, escolha seu cardápio da semana ou informe restrições alimentares.",
  "escolher cardápio": "Cardápio simples:\n- Arroz com feijão\n- Frango grelhado\n- Salada verde\n- Macarrão ao alho e óleo\n- Omelete",
  "avisar restrição": "Por favor, informe sua restrição alimentar para que possamos ajustar o pedido."
};

function appendMessage(text, isBot) {
  const container = document.getElementById('messages');
  const msg = document.createElement('div');
  msg.className = isBot ? 'msg bot' : 'msg user';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  const time = document.createElement('span');
  time.className = 'time';
  const now = new Date();
  time.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  bubble.appendChild(time);
  msg.appendChild(bubble);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('input');
  const userText = input.value.trim();
  if (!userText) return;
  appendMessage(userText, false);
  input.value = '';
  document.getElementById('send').disabled = true;

  const lower = userText.toLowerCase();
  let reply = "Desculpe, não entendi. Por favor, reformule sua pergunta.";
  if (autoResponses[lower]) {
    reply = autoResponses[lower];
  } else {
    for (const trigger in autoResponses) {
      if (lower.includes(trigger)) { reply = autoResponses[trigger]; break; }
    }
  }
  setTimeout(() => {
    appendMessage(reply, true);
    document.getElementById('send').disabled = false;
  }, 300);
});

// Enable send button when there is input
document.getElementById('input').addEventListener('input', function() {
  document.getElementById('send').disabled = this.value.trim().length === 0;
});
// Handle suggestion button clicks
document.querySelectorAll('.suggestion').forEach(btn => {
  btn.addEventListener('click', () => {
    // Extract the plain text of the button (remove emojis and trim)
    const btnText = btn.textContent.replace(/^[^a-zA-Z]+/, '').trim().toLowerCase();
    // Show user message (optional – here we just simulate the user spoke it)
    appendMessage(btn.textContent.trim(), false);
    // Determine reply using same logic as the form handler
    let reply = "Desculpe, não entendi. Por favor, reformule sua pergunta.";
    if (autoResponses[btnText]) {
      reply = autoResponses[btnText];
    } else {
      for (const trigger in autoResponses) {
        if (btnText.includes(trigger)) { reply = autoResponses[trigger]; break; }
      }
    }
    setTimeout(() => {
      appendMessage(reply, true);
    }, 300);
  });
});
