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

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    // Add User Message
    const newUserMsg = { id: Date.now(), type: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Call Gemini RAG Backend
      const response = await chatApi.sendMessage(text);
      
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
        text: "I'm having trouble connecting to the ElectAssist RAG Engine backend. Ensure the FastAPI server is running."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container container animate-fade-in">
      <div className="chat-layout">
        
        {/* Sidebar Info */}
        <div className="chat-sidebar glass-panel">
          <div className="sidebar-header">
            <Sparkles className="text-secondary" />
            <h3>AI Capabilities</h3>
          </div>
          <ul className="capability-list text-muted text-sm">
            <li>Answers grounded in verified candidate manifestos</li>
            <li>Multilingual support (Ask in Hindi, Tamil, etc.)</li>
            <li>Step-by-step voting process guidance</li>
            <li>Local ward boundary understanding</li>
          </ul>
          
          <div className="suggestions-box">
             <p className="text-sm" style={{marginBottom: '10px', color: 'white'}}>Try asking:</p>
             {SUGGESTIONS.map((s, i) => (
               <button key={i} className="suggestion-btn" onClick={() => handleSend(s)}>
                 {s}
               </button>
             ))}
          </div>
        </div>

        {/* Main Interface */}
        <div className="chat-main glass-panel">
           <div className="chat-header">
              <div className="flex-center" style={{gap: '12px'}}>
                <div className="bot-avatar-bg">
                  <Bot size={24} className="text-primary" />
                </div>
                <div>
                  <h3 style={{margin: 0}}>ElectAssist Guide</h3>
                  <span className="live-status">Online (Gemini Pro)</span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setMessages(INITIAL_MESSAGES)} title="Reset Chat">
                 <RefreshCcw size={18} className="text-muted" />
              </button>
           </div>
           
           <div className="chat-history">
              {messages.map(msg => (
                <div key={msg.id} className={`message-wrapper ${msg.type}`}>
                  {msg.type === 'bot' && (
                     <div className="message-avatar bot">
                       <Bot size={16} />
                     </div>
                  )}
                  <div className={`message-bubble ${msg.type}`}>
                    {msg.text}
                  </div>
                  {msg.type === 'user' && (
                     <div className="message-avatar user">
                       <User size={16} />
                     </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="message-wrapper bot">
                  <div className="message-avatar bot"><Bot size={16} /></div>
                  <div className="message-bubble bot typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
           </div>
           
           <div className="chat-input-area">
             <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Ask about candidates, election dates, guidelines..."
               className="chat-input"
             />
             <button className="chat-send-btn bg-primary" onClick={() => handleSend()}>
               <Send size={20} />
             </button>
           </div>
        </div>
        
      </div>
    </div>
  );
};

export default Chat;
