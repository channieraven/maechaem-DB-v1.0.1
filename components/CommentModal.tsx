import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, AtSign, Loader2 } from 'lucide-react';
import { Comment, AppUser } from '../types';

interface CommentModalProps {
  logId: string;
  treeCode: string;
  plotCode: string;
  comments: Comment[];
  users: AppUser[];
  currentUserEmail: string;
  currentUserName: string;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (content: string, mentions: string[]) => Promise<void>;
}

const CommentModal: React.FC<CommentModalProps> = ({
  logId,
  treeCode,
  plotCode,
  comments,
  users,
  currentUserEmail,
  currentUserName,
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users.filter(u =>
    u.email !== currentUserEmail &&
    (u.fullname.toLowerCase().includes(mentionSearch.toLowerCase()) ||
     u.email.toLowerCase().includes(mentionSearch.toLowerCase()))
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart || 0;
    setContent(val);
    setCursorPos(pos);

    const textBeforeCursor = val.slice(0, pos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setMentionSearch(atMatch[1]);
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
      setMentionSearch('');
    }
  };

  const insertMention = (user: AppUser) => {
    const textBeforeCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const newContent = textBeforeCursor.slice(0, atIndex) + `@${user.fullname} ` + textAfterCursor;
    setContent(newContent);
    setShowMentionDropdown(false);
    setMentionSearch('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const extractMentions = (text: string): string[] => {
    const names = text.match(/@([^\s@]+(?:\s+[^\s@]+)*)/g)?.map(m => m.slice(1)) || [];
    const emails: string[] = [];
    names.forEach(name => {
      const user = users.find(u => u.fullname === name || u.email === name);
      if (user) emails.push(user.email);
    });
    return emails;
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    const mentions = extractMentions(content);
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), mentions);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return dateStr;
    }
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(@\S+(?:\s+\S+)*?)(?=\s|$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowMentionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-green-600" />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">ความคิดเห็น</h3>
              <p className="text-xs text-gray-500">{treeCode} · {plotCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">ยังไม่มีความคิดเห็น</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className={`flex gap-3 ${comment.author_email === currentUserEmail ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-green-700">
                    {comment.author_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className={`max-w-[75%] ${comment.author_email === currentUserEmail ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-3 py-2 text-sm ${
                    comment.author_email === currentUserEmail
                      ? 'bg-green-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    <p className="leading-relaxed">{renderContent(comment.content)}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                    {comment.author_name} · {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 shrink-0 relative" ref={dropdownRef}>
          {showMentionDropdown && filteredUsers.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10 max-h-40 overflow-y-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.email}
                  onMouseDown={(e) => { e.preventDefault(); insertMention(user); }}
                  className="w-full text-left px-3 py-2 hover:bg-green-50 flex items-center gap-2 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-green-700">{user.fullname?.charAt(0)?.toUpperCase() || '?'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.fullname}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextChange}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !showMentionDropdown) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="เขียนความคิดเห็น... พิมพ์ @ เพื่อแท็กผู้ใช้"
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 pr-8"
              />
              <AtSign size={14} className="absolute right-2 top-2.5 text-gray-300" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Enter เพื่อส่ง • Shift+Enter ขึ้นบรรทัดใหม่ • @ เพื่อแท็กผู้ใช้</p>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
