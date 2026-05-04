// ─────────────────────────────────────────
// pages/user/UserMessages.jsx
// Messaging interface for users to chat with the authority regarding reports
// ─────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyReports } from "../../services/reportService";
import { getMessagesByReportId, sendMessage } from "../../services/messageService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { colors, fonts } from "../../styles/designTokens";
import { 
  MessageSquare, Send, AlertCircle, FileText, ChevronRight, Activity, Clock
} from "lucide-react";
import { formatDateShort } from "../../utils/dateTimeUtils";

const UserMessages = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Reports list
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoadingReports(true);
        const res = await getMyReports();
        setReports(res.data.reports || []);
      } catch (err) {
        toast.error("Failed to load reports");
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  // Fetch messages when a report is selected
  useEffect(() => {
    if (!selectedReport) return;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await getMessagesByReportId(selectedReport.id);
        setMessages(res.data.messages || []);
      } catch (err) {
        toast.error("Failed to load conversation");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedReport?.id]); // Use ID as dependency instead of whole object

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedReport) return;

    try {
      setSending(true);
      const res = await sendMessage(selectedReport.id, { message: newMessage });
      setMessages(prev => {
        const exists = prev.some(m => m.id === res.data.newMessage.id);
        return exists ? prev : [...prev, res.data.newMessage];
      });
      setNewMessage("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const styleParams = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-charcoal": colors.charcoal,
    "--c-textSecondary": colors.textSecondary,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  return (
    <div style={styleParams} className="min-h-screen bg-[var(--c-offWhite)] pt-24 pb-12 px-4 selection:bg-[var(--c-sage)] selection:text-[var(--c-charcoal)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
        
        {/* Left Pane - Report Selection */}
        <div className="w-full md:w-1/3 bg-white rounded-3xl border border-[var(--c-borderLight)] shadow-sm flex flex-col overflow-hidden h-full">
          <div className="p-6 border-b border-[var(--c-borderLight)] shrink-0">
            <h2 className="text-xl font-bold text-[var(--c-charcoal)] flex items-center gap-2" style={{ fontFamily: fonts.heading }}>
              <MessageSquare className="w-5 h-5 text-[var(--c-olive)]" /> My Complaints
            </h2>
            <p className="text-sm text-[var(--c-textSecondary)] mt-1">Select a report to query the authority.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {loadingReports ? (
              <div className="flex justify-center p-8"><Loader size="md" /></div>
            ) : reports.length === 0 ? (
              <div className="text-center p-8 text-[var(--c-textSecondary)]">
                <FileText className="w-8 h-8 opacity-40 mx-auto mb-2" />
                <p className="text-sm">No reports filed yet.</p>
              </div>
            ) : (
              reports.map(report => (
                <button
                  key={report.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (selectedReport?.id === report.id) return;
                    setSelectedReport(report);
                    // Clear messages immediately or keep them for smoother transition
                    // setMessages([]); // Optional: keep old messages visible for "WhatsApp" feel
                    // Optimistically clear unread count for this report in UI
                    setReports(prev => prev.map(r => r.id === report.id ? { ...r, unread_count: 0 } : r));
                  }}
                  className={`flex flex-col text-left p-4 rounded-2xl transition-all border relative ${
                    selectedReport?.id === report.id
                      ? "bg-[var(--c-sage)]/20 border-[var(--c-sage)] shadow-sm"
                      : "bg-white border-transparent hover:bg-[var(--c-offWhite)]"
                  }`}
                >
                  {/* WhatsApp-style Unread Dot */}
                  {report.unread_count > 0 && selectedReport?.id !== report.id && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" title="New messages from Authority" />
                  )}

                  <div className="flex justify-between items-start mb-1 pr-4">
                    <span className="text-xs font-bold text-[var(--c-olive)] uppercase tracking-wider">Report #{report.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        report.status === "resolved" ? "bg-[var(--c-sage)] text-[var(--c-oliveDark)]" : "bg-gray-100 text-gray-600"
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className={`text-sm ${report.unread_count > 0 ? "font-bold text-[var(--c-charcoal)]" : "font-semibold text-gray-600"} line-clamp-1`}>
                    {report.description}
                  </p>
                  <span className="text-[10px] text-[var(--c-textSecondary)] mt-1.5 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> {formatDateShort(report.latest_message_at || report.created_at)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Pane - Chat Window */}
        <div className="w-full md:w-2/3 bg-white rounded-3xl border border-[var(--c-borderLight)] shadow-sm flex flex-col overflow-hidden h-full">
          {!selectedReport ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--c-textSecondary)]">
              <Activity className="w-12 h-12 opacity-20 mb-4" />
              <p className="text-[15px] font-medium">Select a report to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-5 border-b border-[var(--c-borderLight)] flex items-center justify-between shrink-0 bg-[var(--c-offWhite)]/50">
                <div>
                  <h3 className="font-bold text-[var(--c-charcoal)] flex items-center gap-2">
                    Report #{selectedReport.id}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--c-textSecondary)] mt-0.5">
                    Authority Pincode: {selectedReport.pincode}
                  </p>
                </div>
              </div>

                <div className={`flex-1 overflow-y-auto p-6 flex flex-col gap-4 relative transition-opacity duration-300 ${loadingMessages ? "opacity-60" : "opacity-100"}`}>
                  {loadingMessages && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
                      <Loader size="md" />
                    </div>
                  )}

                  {messages.length === 0 && !loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--c-textSecondary)]">
                      <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                      <p className="text-sm">No messages yet. Send a query to the authority.</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isCitizen = msg.sender_type === "user";
                      return (
                        <div key={msg.id || idx} className={`flex flex-col max-w-[80%] ${isCitizen ? "self-end items-end" : "self-start items-start"}`}>
                          <span className="text-[10px] font-bold text-[var(--c-textSecondary)] mb-1 px-1">
                            {isCitizen ? "You" : msg.sender_name}
                          </span>
                          <div className={`p-4 rounded-2xl ${
                            isCitizen 
                              ? "bg-[var(--c-oliveDark)] text-white rounded-tr-sm shadow-sm" 
                              : "bg-[var(--c-offWhite)] text-[var(--c-charcoal)] border border-[var(--c-borderLight)] rounded-tl-sm shadow-sm"
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1">{formatDateShort(msg.created_at)}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[var(--c-borderLight)] shrink-0 flex gap-3 items-end">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message to the authority..."
                  className="flex-1 max-h-32 min-h-[50px] bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-olive)]/30 focus:border-[var(--c-olive)] resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-12 h-12 rounded-2xl bg-[var(--c-oliveDark)] text-white flex justify-center items-center shrink-0 hover:bg-[var(--c-olive)] disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                >
                  {sending ? <Loader size="sm" variant="spinner" /> : <Send className="w-5 h-5 ml-1" />}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        textarea::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}} />
    </div>
  );
};

export default UserMessages;
