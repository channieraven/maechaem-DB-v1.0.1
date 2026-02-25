import React from 'react';
import { X, Bell, MessageCircle, CheckCheck } from 'lucide-react';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClickNotification: (notification: Notification) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onClickNotification,
}) => {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'เมื่อกี้';
      if (mins < 60) return `${mins} นาทีที่แล้ว`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
      const days = Math.floor(hours / 24);
      return `${days} วันที่แล้ว`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-sm shadow-2xl flex flex-col h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#2d5a27] text-white">
          <div className="flex items-center gap-2">
            <Bell size={18} />
            <h3 className="font-bold">การแจ้งเตือน</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-white/70 hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} />
                อ่านทั้งหมด
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => { onMarkRead(notif.id); onClickNotification(notif); }}
                className={`flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !notif.is_read ? 'bg-green-50/50' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  !notif.is_read ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <MessageCircle size={16} className={!notif.is_read ? 'text-green-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {notif.tree_code} · {formatDate(notif.created_at)}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
