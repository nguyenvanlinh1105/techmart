import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaImage, FaSmile, FaTimes } from 'react-icons/fa';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Chat = () => {
  const { user, isAuthenticated } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isAuthenticated()) return;

    const loadChat = async () => {
      try {
        const conv = await chatService.getMyConversation();
        setConversation(conv);
        const msgs = await chatService.getMessages(conv.id);
        setMessages(msgs);
        scrollToBottom();
      } catch (error) {
        console.error('Error loading chat:', error);
        toast.error('Không thể tải chat');
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!conversation) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const msgs = await chatService.getMessages(conversation.id);
        if (msgs.length > messages.length) {
          setMessages(msgs);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [conversation, messages.length]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;
    if (!conversation) return;

    try {
      setSending(true);
      const tempMessage = {
        id: `temp_${Date.now()}`,
        content: newMessage,
        sender_role: 'user',
        sender_name: user?.name || user?.email,
        created_at: new Date().toISOString(),
        image_url: imagePreview,
        sending: true
      };
      setMessages([...messages, tempMessage]);
      scrollToBottom();

      const sent = await chatService.sendMessage(
        conversation.id,
        newMessage,
        selectedImage ? 'image' : 'text',
        selectedImage
      );

      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...sent, sending: false } : m
      ));

      setNewMessage('');
      removeImage();
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
      setMessages(prev => prev.filter(m => !m.sending));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Vui lòng đăng nhập để chat với admin</p>
          <a href="/login" className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-white overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="h-full flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl">👨‍💼</span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-ping"></span>
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white drop-shadow-lg">
                      Chat với Admin
                    </h1>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <p className="text-sm text-white/90 font-medium">Đang hoạt động • Phản hồi nhanh</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <span className="text-2xl">⚡</span>
                  <span className="text-sm font-bold text-white">Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                    <FaSmile className="w-16 h-16 text-purple-600" />
                  </div>
                  <p className="text-gray-700 text-xl font-bold mb-2">Chào mừng bạn! 👋</p>
                  <p className="text-gray-600 text-lg mb-1">Chưa có tin nhắn nào</p>
                  <p className="text-gray-500 text-sm">Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện!</p>
                  <div className="mt-6 flex justify-center gap-2 flex-wrap">
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">💬 Hỏi về sản phẩm</span>
                    <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">📦 Theo dõi đơn hàng</span>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.sender_role === 'user';
                  
                  return (
                    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%]`}>
                        {!isUser && (
                          <p className="text-xs text-gray-500 mb-1 ml-2">{message.sender_name}</p>
                        )}
                        
                        <div className={`rounded-2xl p-4 shadow-lg transform transition-all duration-300 hover:scale-105 ${
                            isUser
                              ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 text-white rounded-br-none shadow-purple-500/50'
                              : 'bg-white text-gray-900 rounded-bl-none shadow-gray-300/50 border border-gray-100'
                          } ${message.sending ? 'opacity-60 animate-pulse' : ''}`}>
                          {message.image_url && (
                            <img src={message.image_url} alt="Attachment" className="rounded-lg mb-2 max-w-full" />
                          )}
                          
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          
                          <p className={`text-xs mt-2 ${isUser ? 'text-purple-100' : 'text-gray-500'}`}>
                            {formatTime(message.created_at)}
                            {message.sending && ' • Đang gửi...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t-2 border-purple-100 p-6 shadow-lg">
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-24 rounded-xl shadow-lg border-2 border-purple-200" />
                  <button onClick={removeImage} className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-end gap-3">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-md">
                  <FaImage className="w-5 h-5 text-purple-600" />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Nhập tin nhắn... ✨"
                    rows={1}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-inner"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                <button type="submit" disabled={(!newMessage.trim() && !selectedImage) || sending} className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-2xl hover:scale-110 transform">
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaPaperPlane className="w-5 h-5 text-white" />
                  )}
                </button>
              </form>
              
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                <button onClick={() => setNewMessage('Xin chào! Tôi cần hỗ trợ.')} className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-sm font-semibold whitespace-nowrap transition-colors">
                  👋 Xin chào
                </button>
                <button onClick={() => setNewMessage('Tôi muốn kiểm tra đơn hàng của mình.')} className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-full text-sm font-semibold whitespace-nowrap transition-colors">
                  📦 Kiểm tra đơn hàng
                </button>
                <button onClick={() => setNewMessage('Tôi cần hỗ trợ về sản phẩm.')} className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-semibold whitespace-nowrap transition-colors">
                  ❓ Cần hỗ trợ
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
