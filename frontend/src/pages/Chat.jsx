import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import chatService from '../services/chat.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

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
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const attachmentMenuRef = useRef(null);
    const emojiPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
                setIsAttachmentMenuOpen(false);
            }
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setIsEmojiPickerOpen(false);
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

    // Derived state: Filtered groups based on tab and search
    const filteredGroups = useMemo(() => {
        return groupedConversations.filter(group => {
            const matchesTab = activeTab === 'active' ? group.isActive : !group.isActive;
            const matchesSearch = group.partner.nama.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [groupedConversations, activeTab, searchQuery]);

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
                    
                    // Mark as read if there are unread messages from partner
                    const hasUnread = res.data.some(m => m.senderId !== user.id && !m.isRead);
                    if (hasUnread) {
                        await chatService.markAsRead(activeTx.transactionId);
                    }
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
            setIsEmojiPickerOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengirim pesan');
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await chatService.deleteMessage(activeTx.transactionId, messageId);
            setMessages(prev => prev.map(msg => 
                msg.id === messageId ? { ...msg, isDeleted: true, text: null, imageUrl: null, latitude: null, longitude: null } : msg
            ));
            toast.success('Pesan dihapus');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus pesan');
        }
    };

    const handleShareLocation = () => {
        setIsAttachmentMenuOpen(false);
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

    const isTxInactive = activeTx && INACTIVE_STATUSES.includes(activeTx.status);

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prevInput => prevInput + emojiObject.emoji);
    };

    return (
        <div className="bg-background text-on-surface dot-pattern min-h-screen flex flex-col font-body-md text-body-md">
            <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-lg h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-gutter">
                
                {/* SideNavBar (Global) */}
                <aside className="hidden md:flex h-full w-64 shrink-0 border-r border-outline-variant/10 shadow-lg bg-surface-container-low/80 backdrop-blur-xl flex-col gap-stack-md p-gutter z-40 transition-all duration-300 rounded-xl">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-fixed p-0.5 mb-3 bg-white relative">
                            {user?.fotoProfil ? (
                                <img src={`${UPLOADS_URL}${user.fotoProfil}`} alt={user?.nama} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-headline-lg text-[32px]">
                                    {user?.nama?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <h3 className="font-title-md text-title-md text-on-surface text-center line-clamp-1 break-all px-2">{user?.nama}</h3>
                    </div>
                    <nav className="flex flex-col gap-2 flex-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-xl transition-all font-label-md text-label-md">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>person</span> Profile
                        </Link>
                        <Link to="/transactions" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-xl transition-all font-label-md text-label-md">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>history</span> History
                        </Link>
                        <Link to="/chat" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-xl font-bold font-label-md text-label-md translate-x-1 duration-300">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>mail</span> Messages
                        </Link>
                        <Link to="/wallet" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-xl transition-all font-label-md text-label-md">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>account_balance_wallet</span> Wallet
                        </Link>
                    </nav>
                </aside>

                <div className="flex-grow flex flex-col md:flex-row glass-panel rounded-2xl overflow-hidden shadow-lg h-full border border-outline-variant/30 relative min-w-0">
                    
                    {/* Left Sidebar: Chat List */}
                    <div className={`w-full md:w-80 lg:w-96 border-r border-outline-variant/30 flex-col bg-surface-container-lowest/70 relative z-10 backdrop-blur-md ${activePartnerId ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search Header */}
                        <div className="p-4 border-b border-outline-variant/30 bg-surface/50 backdrop-blur-md flex flex-col gap-3">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{fontVariationSettings: "'FILL' 0"}}>search</span>
                                <input 
                                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low text-on-surface rounded-xl border border-outline-variant/30 focus:ring-2 focus:ring-primary/50 focus:border-primary font-body-md text-sm placeholder:text-on-surface-variant transition-all shadow-inner outline-none" 
                                    placeholder="Cari percakapan..." 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {/* Filters */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setActiveTab('active')} 
                                    className={`px-3 py-1 rounded-full font-label-sm text-xs font-semibold shadow-sm transition-colors ${activeTab === 'active' ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-variant text-on-surface-variant'}`}
                                >
                                    Aktif
                                </button>
                                <button 
                                    onClick={() => setActiveTab('archived')} 
                                    className={`px-3 py-1 rounded-full font-label-sm text-xs transition-colors ${activeTab === 'archived' ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'bg-surface-container hover:bg-surface-variant text-on-surface-variant'}`}
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>

                        {/* Contact List */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar bg-transparent">
                            {isLoading ? (
                                <div className="p-4 text-on-surface-variant text-center text-sm">Memuat obrolan...</div>
                            ) : filteredGroups.length === 0 ? (
                                <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                                    <span className="material-symbols-outlined text-[32px] opacity-50 mb-2">chat</span>
                                    <p className="text-sm">Tidak ada percakapan</p>
                                </div>
                            ) : (
                                filteredGroups.map(group => {
                                    const isActivePartner = activePartnerId === group.partner.id;
                                    return (
                                        <button
                                            key={group.partner.id}
                                            onClick={() => handleSelectPartner(group)}
                                            className={`w-full text-left flex items-center p-4 cursor-pointer transition-colors border-l-4 border-b border-b-outline-variant/10 relative ${isActivePartner ? 'bg-primary/10 border-l-primary' : 'hover:bg-surface-container-low border-l-transparent'}`}
                                        >
                                            {isActivePartner && <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>}
                                            <div className="relative">
                                                {group.partner.fotoProfil ? (
                                                    <img className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isActivePartner ? 'border-surface' : 'border-transparent'}`} src={`${UPLOADS_URL}${group.partner.fotoProfil}`} alt={group.partner.nama} />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary-container font-title-md text-lg border-2 ${isActivePartner ? 'border-surface' : 'border-transparent'}`}>
                                                        {group.partner.nama.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {group.isActive && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary-fixed rounded-full border-2 border-surface"></div>}
                                            </div>
                                            <div className="ml-4 flex-grow overflow-hidden z-10">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h4 className={`font-title-md text-base truncate ${isActivePartner ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'}`}>{group.partner.nama}</h4>
                                                    {group.latestMessage && (
                                                        <span className={`font-label-sm text-[11px] ${isActivePartner ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                                                            {new Date(group.latestMessage.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                {group.latestMessage && (
                                                    <div className="flex justify-between items-center">
                                                        <p className={`font-body-md text-sm truncate pr-2 ${isActivePartner ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>
                                                            {group.latestMessage.senderId === user.id ? 'Anda: ' : ''}{group.latestMessage.text || (group.latestMessage.type === 'IMAGE' ? '📷 Gambar' : '📍 Lokasi')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Chat Area */}
                    <div className={`w-full md:flex-1 flex-col bg-surface-container-lowest/40 relative z-0 backdrop-blur-sm ${!activePartnerId ? 'hidden md:flex' : 'flex'}`}>
                        {/* Decorative Background */}
                        <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply dot-pattern"></div>
                        
                        {!activeTx ? (
                            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant z-10 relative">
                                <span className="material-symbols-outlined text-[64px] opacity-30 mb-4">chat_bubble</span>
                                <p className="font-title-md text-[18px] text-on-surface-variant">Pilih percakapan untuk mulai mengirim pesan</p>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface/60 backdrop-blur-lg rounded-tr-2xl z-20 shadow-sm relative">
                                    <div className="flex items-center gap-4">
                                        <button className="md:hidden text-on-surface-variant hover:bg-surface-variant/50 p-1.5 rounded-full transition-colors" onClick={() => setActivePartnerId(null)}>
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>arrow_back</span>
                                        </button>
                                        <div className="relative">
                                            {activeTx.partner.fotoProfil ? (
                                                <img className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shadow-sm" src={`${UPLOADS_URL}${activeTx.partner.fotoProfil}`} alt="" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-bold">
                                                    {activeTx.partner.nama.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-title-md text-title-md text-on-surface leading-tight font-bold">{activeTx.partner.nama}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-2 h-2 bg-secondary-fixed rounded-full shadow-[0_0_4px_#6ffbbe]"></div>
                                                <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`px-3 py-1 text-[12px] font-bold rounded-full ml-4 whitespace-nowrap hidden sm:block ${isTxInactive ? 'bg-surface-variant text-on-surface-variant' : (activeTx.status === 'INQUIRY' ? 'bg-tertiary-container/30 text-tertiary ' : 'bg-primary-container text-on-primary-container')}`}>
                                            {activeTx.status === 'INQUIRY' ? 'Tanya-Tanya' : activeTx.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Shared Item Banner */}
                                <div className="bg-surface-container/60 border-b border-outline-variant/20 p-3 flex items-center justify-between z-10 backdrop-blur-md shadow-inner relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg p-1 shadow-sm border border-outline-variant/30 flex-shrink-0">
                                            {activeTx.item.fotoBarang ? (
                                                <img alt="Item Thumbnail" className="w-full h-full object-cover rounded-md" src={`${UPLOADS_URL}${activeTx.item.fotoBarang.split(',')[0]}`} />
                                            ) : (
                                                <div className="w-full h-full bg-surface-variant rounded-md"></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-label-sm text-xs text-on-surface-variant">Topik Transaksi:</p>
                                            <p className="font-title-md text-sm text-on-surface font-bold truncate max-w-[150px] sm:max-w-xs">{activeTx.item.namaBarang}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsInfoPanelOpen(true)} className="text-primary font-label-md text-xs font-bold hover:bg-primary/10 bg-primary/5 px-3 py-1.5 rounded-lg transition-colors border border-primary/10 whitespace-nowrap shadow-sm">Lihat Detail</button>
                                </div>

                                {/* Messages Area */}
                                <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 z-10 custom-scrollbar relative">
                                    {messages.length === 0 ? (
                                        <div className="flex justify-center my-4">
                                            <span className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 text-on-surface-variant font-label-sm text-[11px] px-4 py-1.5 rounded-full shadow-sm font-semibold">Mulai percakapan dengan {activeTx.partner.nama}</span>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMine = msg.senderId === user.id;
                                            const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                            return (
                                                <div key={msg.id} className={`flex gap-3 max-w-[85%] group ${isMine ? 'self-end mt-2' : ''}`}>
                                                    {!isMine && showAvatar && (
                                                        <img 
                                                            className="w-8 h-8 rounded-full object-cover self-end hidden md:block shadow-sm border border-surface" 
                                                            src={activeTx.partner.fotoProfil ? `${UPLOADS_URL}${activeTx.partner.fotoProfil}` : `https://ui-avatars.com/api/?name=${activeTx.partner.nama}&background=random`} 
                                                            alt="" 
                                                        />
                                                    )}
                                                    {!isMine && !showAvatar && <div className="w-8 h-8 hidden md:block shrink-0"></div>}

                                                    <div className={`flex flex-col gap-1.5 relative ${isMine ? 'items-end' : ''}`}>
                                                        {msg.isDeleted ? (
                                                            <div className={`p-3 px-4 rounded-2xl message-bubble font-body-md text-[14px] leading-relaxed shadow-sm border ${isMine ? 'bg-primary/20 text-on-primary-container border-primary/10 rounded-br-sm' : 'bg-surface-variant/50 text-on-surface-variant border-outline-variant/20 rounded-bl-sm'} flex items-center gap-2 italic`}>
                                                                <span className="material-symbols-outlined text-[16px]">block</span>
                                                                Pesan ini telah dihapus
                                                            </div>
                                                        ) : (
                                                            <div className={`p-4 rounded-2xl message-bubble font-body-md text-[15px] leading-relaxed shadow-sm border ${isMine ? 'bg-primary text-on-primary rounded-br-sm bg-gradient-to-br from-primary to-primary-container border-primary/20' : 'bg-surface-container-lowest text-on-surface rounded-bl-sm border-outline-variant/30'}`}>
                                                                {msg.imageUrl && (
                                                                    <div className="mb-2 rounded-lg overflow-hidden max-w-xs cursor-pointer hover:opacity-90 transition-opacity bg-surface-variant/50 flex items-center justify-center min-h-[100px]">
                                                                        <img src={`${UPLOADS_URL}${msg.imageUrl}`} alt="Attachment" className="w-full h-auto" onClick={() => window.open(`${UPLOADS_URL}${msg.imageUrl}`, '_blank')} />
                                                                    </div>
                                                                )}
                                                                {msg.type === 'LOCATION' && msg.latitude && msg.longitude && (
                                                                    <div className="mb-2">
                                                                        <a href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-black/10 hover:bg-black/20 transition-colors text-sm font-medium">
                                                                            <span className="material-symbols-outlined text-[16px]">location_on</span> Buka di Google Maps
                                                                        </a>
                                                                    </div>
                                                                )}
                                                                {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`flex items-center gap-1.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 whitespace-nowrap ${isMine ? 'right-0 mr-1' : 'left-0 ml-1'}`}>
                                                            {isMine && !msg.isDeleted && (
                                                                <button onClick={() => handleDeleteMessage(msg.id)} className="text-on-surface-variant hover:text-error transition-colors p-0.5" title="Hapus untuk semua orang">
                                                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                                                </button>
                                                            )}
                                                            <span className="font-label-sm text-[11px] text-on-surface-variant">
                                                                {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isMine && !msg.isDeleted && (
                                                                <span className="material-symbols-outlined text-[14px] transition-colors duration-300" style={{color: msg.isRead ? '#34B7F1' : '#9CA3AF', fontVariationSettings: "'FILL' 0"}}>
                                                                    done_all
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-outline-variant/30 bg-surface/70 backdrop-blur-lg rounded-br-2xl z-20 relative">
                                    {isTxInactive ? (
                                        <div className="text-center p-3 text-sm text-on-surface-variant bg-surface-container-low rounded-xl font-medium">
                                            Transaksi ini telah selesai/dibatalkan. Anda tidak dapat membalas pesan.
                                        </div>
                                    ) : (
                                        <>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            toast.error('Ukuran maksimal 5MB');
                                                            e.target.value = '';
                                                            return;
                                                        }
                                                        setSelectedFile(file);
                                                    }
                                                }}
                                            />

                                            {isEmojiPickerOpen && (
                                                <div ref={emojiPickerRef} className="absolute bottom-[calc(100%+10px)] left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-outline-variant/20">
                                                    <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
                                                </div>
                                            )}

                                            <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-surface-container-lowest p-2 rounded-2xl border border-outline-variant/40 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all shadow-inner">
                                                <div className="flex gap-1 pb-1 relative">
                                                    {/* Selected File UI */}
                                                    {selectedFile && (
                                                        <div className="absolute bottom-[calc(100%+16px)] left-0 bg-surface-container-high border border-outline-variant/30 p-2 px-3 rounded-xl shadow-lg flex items-center gap-3 z-20">
                                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                                <span className="material-symbols-outlined text-primary text-[18px]">image</span>
                                                                <span className="truncate text-sm text-on-surface font-medium">{selectedFile.name}</span>
                                                            </div>
                                                            <button type="button" onClick={() => setSelectedFile(null)} className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error/10 bg-surface">
                                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Attachment Menu */}
                                                    <div className="relative" ref={attachmentMenuRef}>
                                                        <button type="button" onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-colors flex-shrink-0" title="Attach file">
                                                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>attach_file</span>
                                                        </button>
                                                        
                                                        {isAttachmentMenuOpen && (
                                                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-surface border border-outline-variant/20 shadow-xl rounded-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-bottom-2">
                                                                <button type="button" onClick={() => { fileInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-on-surface">
                                                                    <span className="material-symbols-outlined text-primary text-[20px]">image</span>
                                                                    Kirim Foto
                                                                </button>
                                                                <button type="button" onClick={handleShareLocation} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-tertiary/10 transition-colors text-on-surface">
                                                                    <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                                                                    Bagikan Lokasi
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button type="button" onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-colors flex-shrink-0" title="Insert emoji">
                                                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>sentiment_satisfied</span>
                                                    </button>
                                                </div>

                                                <textarea 
                                                    className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-2.5 font-body-md text-[15px] text-on-surface placeholder:text-on-surface-variant custom-scrollbar leading-relaxed outline-none" 
                                                    placeholder="Ketik pesan balasan..." 
                                                    rows="1"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage(e);
                                                        }
                                                    }}
                                                    disabled={isSending}
                                                ></textarea>

                                                <button type="submit" onClick={handleSendMessage} disabled={isSending || (!newMessage.trim() && !selectedFile)} className="p-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl transition-all flex-shrink-0 flex items-center justify-center shadow-md transform hover:-translate-y-0.5 mb-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                                    <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
                                                </button>
                                            </form>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* New Right Sidebar: Info Panel (Desktop Only or toggled) */}
                {isInfoPanelOpen && activeTx && (
                    <aside className="absolute md:relative right-0 top-0 bottom-0 z-[100] flex flex-col w-80 glass-panel md:rounded-l-none rounded-2xl p-5 gap-6 overflow-y-auto custom-scrollbar h-full border-l border-outline-variant/30 shadow-2xl md:shadow-lg shrink-0 animate-in slide-in-from-right-8">
                        <div className="flex justify-between items-center -mt-2 -mr-2">
                            <h3 className="font-title-md text-lg text-on-surface font-bold">Info Transaksi</h3>
                            <button onClick={() => setIsInfoPanelOpen(false)} className="p-1.5 text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors">
                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>close</span>
                            </button>
                        </div>
                        
                        <>
                            {/* Detailed Item Card */}
                            <div>
                                <h3 className="font-title-md text-lg text-on-surface font-bold mb-3">Detail Barang</h3>
                                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
                                    <div className="h-32 bg-surface-variant relative">
                                        {activeTx.item.fotoBarang ? (
                                            <img alt="Item Full Image" className="w-full h-full object-cover" src={`${UPLOADS_URL}${activeTx.item.fotoBarang.split(',')[0]}`} />
                                        ) : (
                                            <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                                                <span className="material-symbols-outlined text-outline">image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-md border border-outline-variant/20 shadow-sm">
                                            <span className="font-label-sm text-xs font-bold text-secondary">{activeTx.item.status === 'AVAILABLE' ? 'Tersedia' : 'Disewa'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2">
                                        <h4 className="font-title-md text-base text-on-surface font-bold leading-tight">{activeTx.item.namaBarang}</h4>
                                        <div className="flex items-center gap-1 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 0"}}>category</span>
                                            <span className="font-label-sm text-xs">{activeTx.item.kategori?.namaKategori || 'Lainnya'}</span>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-outline-variant/20">
                                            <p className="font-label-sm text-xs text-on-surface-variant">Harga Sewa</p>
                                            <p className="font-title-md text-primary font-bold">Rp {activeTx.item.hargaSewa.toLocaleString('id-ID')} <span className="text-xs text-on-surface-variant font-normal">/ hari</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction History Overview (Mock for now, as we'd need a specific endpoint to fetch history with specific user) */}
                            <div>
                                <h3 className="font-title-md text-lg text-on-surface font-bold mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 0"}}>history</span>
                                    Status Saat Ini
                                </h3>
                                <div className="flex flex-col gap-3">
                                    <div className={`p-3 rounded-xl border flex gap-3 items-start ${isTxInactive ? 'bg-surface-variant/50 border-outline-variant/20 opacity-70' : 'bg-primary-container/20 border-primary/20'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isTxInactive ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary-container text-primary'}`}>
                                            <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>{isTxInactive ? 'info' : 'sync'}</span>
                                        </div>
                                        <div>
                                            <p className="font-label-md text-sm text-on-surface font-semibold">{activeTx.status === 'INQUIRY' ? 'Tanya-Tanya' : activeTx.status}</p>
                                            <p className="font-label-sm text-xs text-on-surface-variant mt-0.5">Transaksi aktif dengan ID {activeTx.transactionId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Safety Tips */}
                            <div className="mt-auto pt-4">
                                <div className="bg-tertiary-container/10 p-4 rounded-xl border border-tertiary/20">
                                    <h4 className="font-title-md text-sm text-tertiary font-bold mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>shield</span>
                                        Tips Transaksi Aman
                                    </h4>
                                    <ul className="flex flex-col gap-2 font-label-sm text-xs text-on-surface-variant">
                                        <li className="flex gap-2 items-start">
                                            <span className="text-tertiary font-bold">•</span>
                                            Pastikan mengecek kondisi barang saat serah terima.
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <span className="text-tertiary font-bold">•</span>
                                            Gunakan metode pembayaran di dalam aplikasi jika memungkinkan.
                                        </li>
                                        <li className="flex gap-2 items-start">
                                            <span className="text-tertiary font-bold">•</span>
                                            Bertemu di tempat ramai dan terang di area kampus.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </>
                    </aside>
                )}
            </main>
        </div>
    );
};

export default Chat;
