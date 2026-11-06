import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import './style.css';
import ChatHeader from './components/chat_header.jsx';

const formatTime = () =>
	new Intl.DateTimeFormat('pt-BR', {
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date());

/** @typedef {{ role: 'user' | 'assistant', content: string, time: string, error?: boolean }} ChatMessage */
/** @typedef {{ role: 'user' | 'assistant', content: string }} HistoryMessage */

export function App() {
	const [messages, setMessages] = useState(/** @type {ChatMessage[]} */ ([]));
	const [history, setHistory] = useState(/** @type {HistoryMessage[]} */ ([]));
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const messagesRef = useRef(/** @type {HTMLDivElement | null} */ (null));
	const inputRef = useRef(/** @type {HTMLTextAreaElement | null} */ (null));

	useEffect(() => {
		const element = messagesRef.current;
		if (element) element.scrollTop = element.scrollHeight;
	}, [messages, loading]);

	async function sendMessage(/** @type {string} */ text) {
		const content = text.trim();
		if (!content || loading) return;

		const pendingHistory = /** @type {HistoryMessage[]} */ (
			[...history, { role: 'user', content }].slice(-20)
		);
		setMessages((current) => [
			...current,
			{ role: 'user', content, time: formatTime() },
		]);
		setInput('');
		setLoading(true);

		try {
			const response = await fetch('/chat.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: pendingHistory }),
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `A solicitação falhou (HTTP ${response.status}).`);
			}
			if (typeof data.reply !== 'string' || !data.reply.trim()) {
				throw new Error('A resposta recebida está vazia ou inválida.');
			}

			setHistory([
				...pendingHistory,
				/** @type {HistoryMessage} */ ({ role: 'assistant', content: data.reply }),
			].slice(-20));
			setMessages((current) => [
				...current,
				{ role: 'assistant', content: data.reply, time: formatTime() },
			]);
		} catch (/** @type {unknown} */ error) {
			console.error('Erro ao conversar com a IA:', error);
			setMessages((current) => [
				...current,
				{
					role: 'assistant',
					content: error instanceof Error ? error.message : 'Não foi possível obter uma resposta.',
					time: formatTime(),
					error: true,
				},
			]);
		} finally {
			setLoading(false);
			inputRef.current?.focus();
		}
	}

	function handleSubmit(/** @type {Event} */ event) {
		event.preventDefault();
		sendMessage(input);
	}

	function startNewChat() {
		if (loading) return;
		setMessages([]);
		setHistory([]);
		setInput('');
		inputRef.current?.focus();
	}

	return (
		<div class="app">
			<aside class={`sidebar ${sidebarOpen ? 'open' : ''}`}>
				<div class="brand">
					<div class="brand-mark" />
					<div>
						<h1>Food Dinner</h1>
						<p>Marmitas com carinho, todo dia</p>
					</div>
				</div>

				<div>
					<p class="section-label">Como está sua fome hoje?</p>
					<div class="moods">
						<button class="mood" type="button">😋<span>Faminto</span></button>
						<button class="mood" type="button">🙂<span>Com fome</span></button>
						<button class="mood" type="button">😐<span>Mais ou menos</span></button>
						<button class="mood" type="button">😌<span>De boa</span></button>
					</div>
				</div>

				<div class="breath">
					<p class="section-label">Prato do dia</p>
					<div class="breath-circle">🍛</div>
					<button type="button">Me surpreenda</button>
				</div>
			</aside>

			<main class="chat">
				<ChatHeader
					status={loading ? 'Preparando uma resposta...' : 'Pronto para anotar seu pedido'}
					onNewChat={startNewChat}
					onMenuClick={() => setSidebarOpen((open) => !open)}
					newChatDisabled={loading}
				/>

				<section class="messages" ref={messagesRef} aria-live="polite">
					{messages.length === 0 && (
						<div class="welcome">
							<h3>Olá. Que bom te ver,<em>que fome é hoje?</em></h3>
							<p>Escolha seu cardápio, avise restrições ou pause entregas. Sem complicação.</p>
							<div class="suggestions">
								<button class="suggestion" type="button" onClick={() => sendMessage('Escolher cardápio')} disabled={loading}>
									🥗 Escolher cardápio
								</button>
								<button class="suggestion" type="button" onClick={() => sendMessage('Quero avisar uma restrição alimentar')} disabled={loading}>
									⚠️ Avisar restrição
								</button>
							</div>
						</div>
					)}

					{messages.map((message, index) => (
						<div
							key={`${message.time}-${index}`}
							class={`msg ${message.role === 'assistant' ? 'bot' : 'user'} ${message.error ? 'error' : ''}`}
						>
							{message.role === 'assistant' && <div class="avatar" />}
							<div class="bubble">
								{message.content}
								<span class="time">{message.time}</span>
							</div>
						</div>
					))}

					{loading && (
						<div class="msg typing" aria-label="A IA está respondendo">
							<div class="avatar" />
							<div class="bubble"><span /><span /><span /></div>
						</div>
					)}
				</section>

				<div class="composer">
					<form onSubmit={handleSubmit}>
						<textarea
							ref={inputRef}
							value={input}
							onInput={(event) => setInput(event.currentTarget.value)}
							disabled={loading}
							placeholder="Escreva seu pedido..."
							aria-label="Escreva sua mensagem"
						/>
						<button class="send" type="submit" aria-label="Enviar" disabled={loading || !input.trim()}>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M5 12h14M13 6l6 6-6 6" />
							</svg>
						</button>
					</form>
					<p class="disclaimer">O GulosoAgent cuida do cardápio, das restrições alimentares e das pausas de entrega da FoodDinner.</p>
				</div>
			</main>
		</div>
	);
}

const root = document.getElementById('app');
if (root) render(<App />, root);