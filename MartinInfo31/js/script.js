// Seleção de elementos do DOM
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');

// Função de Auto-scroll (Rola para o final da conversa)
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para criar e renderizar balões no DOM
function renderMessage(text, isUser = false) {
  const messageDiv = document.createElement('div');
  
  if (isUser) {
    messageDiv.className = 'flex items-start gap-2.5 flex-row-reverse';
    messageDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
        👤
      </div>
      <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3.5 max-w-[85%] shadow-sm text-sm">
        ${text}
      </div>
    `;
  } else {
    messageDiv.className = 'flex items-start gap-2.5';
    messageDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
        🤖
      </div>
      <div class="bg-slate-800 border border-red-900 rounded-2xl rounded-tl-none p-3.5 max-w-[85%] text-slate-200 shadow-sm text-sm">
        ${text}
      </div>
    `;
  }

  // Insere a mensagem antes do indicador de loading
  chatMessages.insertBefore(messageDiv, loadingIndicator);
  scrollToBottom();
}

// Simulação da chamada de API com async / await
async function enviarDesculpaParaIA(texto) {
  // Esconde erros anteriores e mostra o loading
  errorMessage.classList.add('hidden');
  loadingIndicator.classList.remove('hidden');
  scrollToBottom();

  try {
    // SIMULAÇÃO DE ESPERA DE REDE (Aqui entrará o fetch POST real futuramente)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Exemplo de resposta simulated da IA
    const broncas = [
      "A preguiça não paga boleto. Levanta da cadeira e vai fazer o que precisa!",
      "Sério mesmo essa desculpa? Se você usasse metade dessa criatividade pra trabalhar, já estaria milionário.",
      "Para de chorar no meu ouvido e assume a responsabilidade pelas tuas escolhas!",
      "Gastei meu tempo lendo isso? Crie vergonha na cara!"
    ];
    
    const respostaIA = broncas[Math.floor(Math.random() * broncas.length)];
    
    // Renderiza resposta da IA
    renderMessage(respostaIA, false);

  } catch (error) {
    // Exceção / Tratamento de erro visual
    console.error('Erro na requisição:', error);
    errorMessage.classList.remove('hidden');
  } finally {
    // Esconde o indicador de loading ao terminar
    loadingIndicator.classList.add('hidden');
    scrollToBottom();
  }
}

// Evento de envio do formulário
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const text = userInput.value.trim();
  if (!text) return;

  // 1. Renderiza a mensagem do usuário imediatamente
  renderMessage(text, true);
  
  // Limpa o input
  userInput.value = '';

  // 2. Chama a função assíncrona da IA
  await enviarDesculpaParaIA(text);
});