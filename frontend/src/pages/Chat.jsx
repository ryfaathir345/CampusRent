// src/pages/Chat.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { Send, User, Package, MessageSquare, ImagePlus, MapPin, ExternalLink, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import chatService from '../services/chat.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_URL = API_URL.replace('/api', '');

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [activePartnerId, setActivePartnerId] = useState(location.state?.selectedUser?.id || null);
  const [activeTxId, setActiveTxId] = useState(location.state?.activeTxId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Constants
  const INACTIVE_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];

  // Derived state: Group conversations by partner
  const groupedConversations = useMemo(() => {
    const groups = {};
    conversations.forEach(conv => {
      if (!conv.partner) return;
      const pid = conv.partner.id;
      if (!groups[pid]) {
        groups[pid] = {
          partner: conv.partner,
          conversations: [],
          latestMessage: conv.lastMessage,
          latestUpdatedAt: new Date(conv.lastMessage?.createdAt || conv.item?.updatedAt || Date.now()).getTime(),
          isActive: false
        };
      }
      
      groups[pid].conversations.push(conv);
      
      if (!INACTIVE_STATUSES.includes(conv.status)) {
        groups[pid].isActive = true;
      }

      const msgTime = new Date(conv.lastMessage?.createdAt || conv.item?.updatedAt || Date.now()).getTime();
      if (msgTime > groups[pid].latestUpdatedAt) {
        groups[pid].latestUpdatedAt = msgTime;
        groups[pid].latestMessage = conv.lastMessage;
      }
    });
    return Object.values(groups).sort((a, b) => b.latestUpdatedAt - a.latestUpdatedAt);
  }, [conversations]);

  // Derived state: Filtered groups based on tab
  const filteredGroups = useMemo(() => {
    return groupedConversations.filter(group => 
      activeTab === 'active' ? group.isActive : !group.isActive
    );
  }, [groupedConversations, activeTab]);

  // Derived state: Active Transaction context
  const activeTx = useMemo(() => {
    if (!activePartnerId || !activeTxId) return null;
    const group = groupedConversations.find(g => g.partner.id === activePartnerId);
    if (!group) return null;
    return group.conversations.find(c => c.transactionId === activeTxId) || group.conversations[0];
  }, [activePartnerId, activeTxId, groupedConversations]);

  const handleSelectPartner = (group) => {
    setActivePartnerId(group.partner.id);
    const activeTxForPartner = group.conversations.find(c => !INACTIVE_STATUSES.includes(c.status)) || group.conversations[0];
    setActiveTxId(activeTxForPartner.transactionId);
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Load conversations initially
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await chatService.getConversations();
        setConversations(res.data);
        
        // Handle incoming state navigation
        if (location.state?.selectedUser) {
          setActivePartnerId(location.state.selectedUser.id);
          if (location.state.activeTxId) {
            setActiveTxId(location.state.activeTxId);
          }
        }
      } catch (err) {
        toast.error('Gagal memuat daftar obrolan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, [location.state]);

  // Poll messages for active transaction
  useEffect(() => {
    let interval;
    if (activeTx) {
      const fetchMessages = async () => {
        try {
          const res = await chatService.getMessages(activeTx.transactionId);
          setMessages(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      
      // Fetch immediately
      fetchMessages();
      
      // Polling every 3 seconds
      interval = setInterval(fetchMessages, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTx]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    setIsSending(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        if (newMessage.trim()) formData.append('text', newMessage);
        formData.append('type', 'IMAGE');
        const res = await chatService.sendMessage(activeTx.transactionId, formData);
        setMessages(prev => [...prev, res.data]);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const res = await chatService.sendMessage(activeTx.transactionId, { text: newMessage, type: 'TEXT' });
        setMessages(prev => [...prev, res.data]);
      }
      setNewMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Browser Anda tidak mendukung fitur lokasi');
      return;
    }

    setIsSending(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await chatService.sendMessage(activeTx.transactionId, {
            type: 'LOCATION',
            latitude,
            longitude,
            text: '📍 Membagikan lokasi'
          });
          setMessages(prev => [...prev, res.data]);
        } catch (err) {
          toast.error('Gagal mengirim lokasi');
        } finally {
          setIsSending(false);
        }
      },
      (error) => {
        toast.error('Tidak dapat mengambil lokasi');
        setIsSending(false);
      }
    );
  };

  const renderSidebar = () => {
    if (isLoading) {
      return <div className="p-4 text-gray-500 text-center">Memuat obrolan...</div>;
    }

    if (conversations.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400 flex flex-col items-center">
          <MessageSquare size={32} className="text-gray-300 dark:text-slate-600 mb-2" />
          <p className="text-sm">Belum ada percakapan</p>
        </div>
      );
    }

    return (
      <div className="overflow-y-auto h-full">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <p className="text-sm">Tidak ada obrolan di tab ini</p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <button
              key={group.partner.id}
              onClick={() => handleSelectPartner(group)}
              className={`w-full text-left p-4 border-b border-gray-100 dark:border-slate-700 transition-colors flex items-center gap-3 ${activePartnerId === group.partner.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                {group.partner.fotoProfil ? (
                  <img src={`${UPLOADS_URL}${group.partner.fotoProfil}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  group.partner.nama.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900 dark:text-slate-100 truncate">{group.partner.nama}</h4>
                  <span className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700">
                    {group.conversations.length} Transaksi
                  </span>
                </div>
                {group.latestMessage && (
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {group.latestMessage.senderId === user.id ? 'Anda: ' : ''}{group.latestMessage.text}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    );
  };

  const isTxInactive = activeTx && INACTIVE_STATUSES.includes(activeTx.status);

  const renderChatArea = () => {
    if (!activeTx) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-900/50">
          <MessageSquare size={48} className="mb-4 text-gray-300 dark:text-slate-600" />
          <p className="text-lg font-medium text-gray-500 dark:text-slate-400">Pilih percakapan untuk mulai mengirim pesan</p>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden flex-shrink-0">
              {activeTx.partner.fotoProfil ? (
                <img src={`${UPLOADS_URL}${activeTx.partner.fotoProfil}`} alt="" className="w-full h-full object-cover" />
              ) : (
                activeTx.partner.nama.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h3 className="font-bold text-gray-900 dark:text-slate-100 whitespace-nowrap">{activeTx.partner.nama}</h3>
              <div className="flex-1 flex items-center bg-gray-50 dark:bg-slate-700/50 rounded-xl px-3 py-1.5 max-w-sm relative cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-colors" onClick={() => setIsDropdownOpen(!isDropdownOpen)} ref={dropdownRef}>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-400 mr-2 whitespace-nowrap font-bold">Topik:</span>
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">
                    {activeTx.item.namaBarang}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl shadow-blue-900/5 rounded-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                    {groupedConversations.find(g => g.partner.id === activePartnerId)?.conversations.map(c => (
                      <button 
                        key={c.transactionId} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTxId(c.transactionId);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all flex flex-col border-l-2 ${activeTxId === c.transactionId ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-500' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-transparent'}`}
                      >
                        <span className="font-bold truncate">{c.item.namaBarang}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${c.status === 'COMPLETED' || c.status === 'REJECTED' || c.status === 'CANCELLED' ? 'text-gray-400 dark:text-slate-500' : (c.status === 'INQUIRY' ? 'text-purple-500 dark:text-purple-400' : 'text-blue-500 dark:text-blue-400')}`}>{c.status === 'INQUIRY' ? 'Tanya-Tanya' : c.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ml-4 whitespace-nowrap ${isTxInactive ? 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300' : (activeTx.status === 'INQUIRY' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400')}`}>
            {activeTx.status === 'INQUIRY' ? 'Tanya-Tanya' : activeTx.status}
          </span>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-slate-500 mt-10 text-sm">
              Belum ada pesan. Mulai sapa {activeTx.partner.nama}!
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === user.id;
              const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`flex max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                    
                    {/* Avatar */}
                    {showAvatar ? (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 text-xs font-bold flex-shrink-0 mt-auto mb-1 overflow-hidden">
                        {isMine ? (
                          user.fotoProfil ? <img src={`${UPLOADS_URL}${user.fotoProfil}`} className="w-full h-full object-cover" /> : user.nama.charAt(0).toUpperCase()
                        ) : (
                          activeTx.partner.fotoProfil ? <img src={`${UPLOADS_URL}${activeTx.partner.fotoProfil}`} className="w-full h-full object-cover" /> : activeTx.partner.nama.charAt(0).toUpperCase()
                        )}
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0"></div>
                    )}

                    {/* Bubble */}
                    <div className="flex flex-col">
                      <div className={`px-4 py-2.5 rounded-2xl ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-100 dark:border-slate-700 shadow-sm rounded-bl-sm'}`}>
                        {msg.imageUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden max-w-xs cursor-pointer hover:opacity-90 transition-opacity">
                            <img src={`${UPLOADS_URL}${msg.imageUrl}`} alt="Attachment" className="w-full h-auto" onClick={() => window.open(`${UPLOADS_URL}${msg.imageUrl}`, '_blank')} />
                          </div>
                        )}
                        {msg.type === 'LOCATION' && msg.latitude && msg.longitude && (
                          <div className="mb-2">
                            <a href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-sm">
                              <MapPin size={16} /> Buka di Google Maps <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                        {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                      </div>
                      <span className={`text-[10px] text-gray-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
          {isTxInactive ? (
            <div className="text-center p-3 text-sm text-gray-500 bg-gray-50 dark:bg-slate-700/50 rounded-xl font-medium">
              Transaksi ini telah selesai/dibatalkan. Anda tidak dapat membalas pesan ini.
            </div>
          ) : (
            <>
              {selectedFile && (
                <div className="mb-2 flex items-center justify-between bg-blue-50 dark:bg-slate-700 p-2 rounded-lg text-sm">
                  <span className="truncate flex-1">{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-600 ml-2 font-bold p-1">X</button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                <button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={isSending}
                  className="p-3 text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
                  title="Bagikan Lokasi"
                >
                  <MapPin size={20} />
                </button>
                <label className="p-3 cursor-pointer text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50" title="Kirim Gambar">
                  <ImagePlus size={20} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Ukuran gambar terlalu besar, maksimal 5MB');
                          e.target.value = '';
                          return;
                        }
                        setSelectedFile(file);
                      }
                    }}
                    disabled={isSending}
                  />
                </label>
                <input
                  type="text"
                  placeholder="Tulis pesan..."
                  className="flex-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <button 
                  type="submit" 
                  disabled={isSending || (!newMessage.trim() && !selectedFile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] min-h-[600px] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-gray-100 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800 z-10">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Pesan</h2>
          </div>
          <div className="flex border-b border-gray-100 dark:border-slate-700 text-sm">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Aktif
            </button>
            <button 
              onClick={() => setActiveTab('archived')}
              className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === 'archived' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-400'}`}
            >
              Selesai
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderSidebar()}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800">
          {renderChatArea()}
        </div>

      </div>
    </div>
  );
};

export default Chat;
