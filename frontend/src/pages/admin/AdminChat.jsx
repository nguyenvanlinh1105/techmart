import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaImage, FaSearch, FaTimes, FaCircle, FaCheck } from 'react-icons/fa';
import { chatService } from '../../services/chatService';
import { toast } from 'react-toastify';

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const convPollRef = useRef(null);
  const msgPollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await chatService.adminGetConversations();
        setConversations(convs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
    convPollRef.current = setInterval(loadConversations, 5000);

    return () => {
      if (convPollRef.current) clearInterval(convPollRef.current);
    };
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      try {
        const msgs = await chatService.adminGetMessages(selectedConv.id);
        setMessages(msgs);
        scrollToBottom();
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
    msgPollRef.current = setInterval(loadMessages, 3000);

    return () => {
      if (msgPollRef.current) clearInterval(msgPollRef.current);
    };
  }, [selectedConv]);

  // Handle image selection
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

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;
    if (!selectedConv) return;

    try {
      setSending(true);

      // Optimistic update
      const tempMessage = {
        id: `temp_${Date.now()}`,
        content: newMessage,
        sender_role: 'admin',
        sender_name: 'Admin',
        created_at: new Date().toISOString(),
        image_url: imagePreview,
        sending: true
      };
      setMessages([...messages, tempMessage]);
      scrollToBottom();

      const sent = await chatService.adminSendMessage(
        selectedConv.id,
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

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      {/* Conversations Sidebar */}
      <div className="w-96 bg-white/80 backdrop-blur-xl border-r border-purple-100 flex flex-col shadow-2xl relative z-10">
        {/* Header - Enhanced */}
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
              <span className="text-white font-bold text-xl">💬</span>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Hỗ Trợ Khách Hàng
              </h1>
              <p className="text-sm text-gray-600 font-medium">Admin Dashboard</p>
            </div>
          </div>
          
          {/* Search - Enhanced */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          
          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
              <p className="text-xs font-semibold opacity-90">Tổng Chat</p>
              <p className="text-2xl font-black">{conversations.length}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white">
              <p className="text-xs font-semibold opacity-90">Chưa đọc</p>
              <p className="text-2xl font-black">
                {conversations.reduce((sum, c) => sum + (c.unread_count_admin || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedConv?.id === conv.id
                    ? 'bg-purple-50 border-l-4 border-l-purple-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">
                        {conv.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{conv.user_name}</p>
                      <p className="text-sm text-gray-500 truncate">{conv.user_email}</p>
                    </div>
                  </div>
                  {conv.unread_count_admin > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {conv.unread_count_admin}
                    </span>
                  )}
                </div>
                
                {conv.last_message && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {conv.last_message}
                    </p>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedConv.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedConv.user_name}</h2>
                  <p className="text-sm text-gray-600">{selectedConv.user_email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FaCircle className="w-2 h-2 text-green-500" />
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-purple-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có tin nhắn</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isAdmin = message.sender_role === 'admin';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%]`}>
                        {!isAdmin && (
                          <p className="text-xs text-gray-500 mb-1 ml-2">{message.sender_name}</p>
                        )}
                        
                        <div
                          className={`rounded-2xl p-4 shadow-md ${
                            isAdmin
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none'
                          } ${message.sending ? 'opacity-60' : ''}`}
                        >
                          {message.image_url && (
                            <img
                              src={message.image_url}
                              alt="Attachment"
                              className="rounded-lg mb-2 max-w-full"
                            />
                          )}
                          
                          {message.content && (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            <p className={`text-xs ${isAdmin ? 'text-purple-100' : 'text-gray-500'}`}>
                              {formatTime(message.created_at)}
                            </p>
                            {isAdmin && message.is_read && (
                              <FaCheck className="w-3 h-3 text-purple-100" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t p-6">
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-24 rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-end gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <FaImage className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="w-full px-6 py-4 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImage) || sending}
                  className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                >
                  <FaPaperPlane className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FaSearch className="w-12 h-12 text-purple-600" />
              </div>
              <p className="text-xl text-gray-600 font-semibold">Chọn cuộc trò chuyện</p>
              <p className="text-gray-500 mt-2">Chọn một cuộc trò chuyện để bắt đầu chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
