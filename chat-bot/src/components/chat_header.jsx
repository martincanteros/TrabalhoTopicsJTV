/**
 * @param {{
 * 	status: string,
 * 	onNewChat: () => void,
 * 	onMenuClick: () => void,
 * 	newChatDisabled: boolean
 * }} props
 */
export default function ChatHeader({ status, onNewChat, onMenuClick, newChatDisabled }) {
	return (
    <header class="chat-header">
      <div class="header-left">
        <button class="menu-btn" type="button" onClick={onMenuClick} aria-label="Abrir menu">☰</button>
        <div>
          <h2>Converse com o GulosoAgent</h2>
          <span class="status">{status}</span>
        </div>
      </div>
      <button class="new-chat" type="button" onClick={onNewChat} disabled={newChatDisabled}>Novo pedido</button>
    </header>
	);
}
