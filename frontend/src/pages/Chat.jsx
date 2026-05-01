import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCcw } from 'lucide-react';
import { chatApi } from '../lib/api';
import './Chat.css';

const INITIAL_MESSAGES = [
  {
    id: 1,
    type: 'bot',
    text: 'Hello! I am your AI Election Guide powered by Gemini. Ask me anything about candidates, polling booths, or the election process.',
  }
];

const SUGGESTIONS = [
  "Who are the top candidates in my ward?",
  "What is the process for voter registration?",
  "Summarize the manifesto for Ward 5.",
  "When is the next local election?"
];

const Chat = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);
  const chatHistoryRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newUserMsg = { id: Date.now(), type: 'user', text: trimmed };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatApi.sendMessage(trimmed);
      const newBotMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.answer || "I received an empty response. Please try again."
      };
      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm having trouble connecting to the ElectAssist backend. Please ensure the server is running."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      // Return focus to input after response
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-container container animate-fade-in">
      {/* Page title for screen readers */}
      <h1 className="visually-hidden">AI Election Chat Guide</h1>

      <div className="chat-layout">

        {/* Sidebar Info */}
        <aside className="chat-sidebar glass-panel" aria-label="AI Chat capabilities">
          <div className="sidebar-header">
            <Sparkles className="text-secondary" aria-hidden="true" />
            <h2>AI Capabilities</h2>
          </div>
          <ul className="capability-list text-muted text-sm" aria-label="List of AI capabilities">
            <li>Answers grounded in verified candidate manifestos</li>
            <li>Multilingual support (Ask in Hindi, Tamil, etc.)</li>
            <li>Step-by-step voting process guidance</li>
            <li>Local ward boundary understanding</li>
          </ul>

          <div className="suggestions-box">
            <p className="text-sm" style={{ marginBottom: '10px', color: 'white' }}>Try asking:</p>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="suggestion-btn"
                onClick={() => handleSend(s)}
                aria-label={`Suggested question: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Chat Interface */}
        <section
          className="chat-main glass-panel"
          aria-label="Chat conversation"
        >
          <div className="chat-header">
            <div className="flex-center" style={{ gap: '12px' }}>
              <div className="bot-avatar-bg" aria-hidden="true">
                <Bot size={24} className="text-primary" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>ElectAssist Guide</h2>
                <span className="live-status" aria-label="Status: Online, powered by Gemini Pro">
                  Online (Gemini Pro)
                </span>
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={handleReset}
              aria-label="Reset chat conversation"
              title="Reset Chat"
            >
              <RefreshCcw size={18} className="text-muted" aria-hidden="true" />
            </button>
          </div>

          {/* Chat history with ARIA live region so screen readers announce new messages */}
          <div
            className="chat-history"
            ref={chatHistoryRef}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            aria-atomic="false"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message-wrapper ${msg.type}`}
                role="listitem"
              >
                {msg.type === 'bot' && (
                  <div className="message-avatar bot" aria-hidden="true">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`message-bubble ${msg.type}`}
                  aria-label={`${msg.type === 'bot' ? 'ElectAssist' : 'You'}: ${msg.text}`}
                >
                  {msg.text}
                </div>
                {msg.type === 'user' && (
                  <div className="message-avatar user" aria-hidden="true">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper bot" role="status" aria-label="ElectAssist is typing">
                <div className="message-avatar bot" aria-hidden="true"><Bot size={16} /></div>
                <div className="message-bubble bot typing-indicator" aria-hidden="true">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} aria-hidden="true" />
          </div>

          <div className="chat-input-area" role="form" aria-label="Send a message">
            <label htmlFor="chat-input" className="visually-hidden">
              Type your election question
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about candidates, election dates, guidelines..."
              className="chat-input"
              aria-label="Type your election question and press Enter or click Send"
              autoComplete="off"
            />
            <button
              className="chat-send-btn bg-primary"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={20} aria-hidden="true" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Chat;
