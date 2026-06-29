// src/components/common/NotificationsDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import notificationService from '../../services/notification.service';
import toast from 'react-hot-toast';

const NotificationsDropdown = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [notifications, setNotifications] = useState([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const dropdownRef = useRef(null);

 const fetchNotifications = async () => {
 try {
 const res = await notificationService.getNotifications();
 setNotifications(res.data);
 setUnreadCount(res.data.filter(n => !n.isRead).length);
 } catch (err) {
 console.error(err);
 }
 };

 useEffect(() => {
 fetchNotifications();
 // Refresh notifications every 15 seconds
 const interval = setInterval(fetchNotifications, 15000);
 return () => clearInterval(interval);
 }, []);

 // Close when clicking outside
 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleMarkAsRead = async (id, e) => {
 e.stopPropagation();
 try {
 await notificationService.markAsRead(id);
 setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
 setUnreadCount(prev => Math.max(0, prev - 1));
 } catch (err) {
 toast.error('Gagal menandai telah dibaca');
 }
 };

 const handleMarkAllAsRead = async () => {
 try {
 await notificationService.markAllAsRead();
 setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
 setUnreadCount(0);
 } catch (err) {
 toast.error('Gagal');
 }
 };

 return (
 <div className="relative" ref={dropdownRef}>
 <button 
 onClick={() => setIsOpen(!isOpen)}
 className={`relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors ${isOpen ? 'bg-gray-100 ' : ''}`}
 >
 <Bell size={20} />
 {unreadCount > 0 && (
 <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
 {unreadCount > 9 ? '9+' : unreadCount}
 </div>
 )}
 </button>

 {isOpen && (
 <div 
 className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl py-2 z-50 overflow-hidden flex flex-col bg-white border border-gray-100 shadow-xl"
 style={{
 maxHeight: '400px'
 }}
 >
 <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
 <h3 className="font-bold text-gray-900">Notifikasi</h3>
 {unreadCount > 0 && (
 <button 
 onClick={handleMarkAllAsRead}
 className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
 >
 <Check size={14} /> Tandai semua dibaca
 </button>
 )}
 </div>
 
 <div className="overflow-y-auto flex-1">
 {notifications.length === 0 ? (
 <div className="p-6 text-center text-gray-400">
 <Bell size={32} className="mx-auto mb-2 text-gray-300" />
 <p className="text-sm">Belum ada notifikasi</p>
 </div>
 ) : (
 notifications.map(notif => (
 <div 
 key={notif.id} 
 className={`p-4 border-b border-gray-50 flex gap-3 ${notif.isRead ? 'bg-white ' : 'bg-blue-50/50 '}`}
 >
 <div className={`mt-0.5 rounded-full p-1.5 h-fit ${notif.isRead ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600 '}`}>
 {notif.isRead ? <CheckCircle2 size={16} /> : <Bell size={16} />}
 </div>
 <div className="flex-1">
 <p className={`text-sm ${notif.isRead ? 'text-gray-600 ' : 'text-gray-900 font-medium'}`}>
 {notif.message}
 </p>
 <p className="text-xs text-gray-400 mt-1">
 {new Date(notif.createdAt).toLocaleString('id-ID')}
 </p>
 </div>
 {!notif.isRead && (
 <button 
 onClick={(e) => handleMarkAsRead(notif.id, e)}
 className="text-blue-600 p-1 hover:bg-blue-100 rounded-full h-fit transition-colors"
 title="Tandai dibaca"
 >
 <Check size={16} />
 </button>
 )}
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 );
};

export default NotificationsDropdown;
