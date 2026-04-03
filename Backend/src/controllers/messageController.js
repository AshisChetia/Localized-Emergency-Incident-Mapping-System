import ReportMessage from "../models/ReportMessage.js";
import Report from "../models/Report.js";

// Fetch all messages for a specific report
export const getMessagesByReportId = async (req, res) => {
  const { reportId } = req.params;
  const { id: userId, role, pincode: userPincode } = req.user;

  try {
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Authorization checks
    if (role === "user" && String(report.user_id) !== String(userId)) {
      return res.status(403).json({ message: "You can only view messages for your own reports." });
    }
    if (role === "authority" && String(report.pincode) !== String(userPincode)) {
      return res.status(403).json({ message: "You can only view messages for reports in your jurisdiction." });
    }

    const messages = await ReportMessage.findByReportId(reportId);
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return res.status(500).json({ message: "Server error while fetching messages" });
  }
};

// Send a new message regarding a report
export const sendMessage = async (req, res) => {
  const { reportId } = req.params;
  const { message } = req.body;
  const { id: senderId, role, pincode: userPincode } = req.user;

  try {
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Authorization checks
    if (role === "user" && String(report.user_id) !== String(senderId)) {
      return res.status(403).json({ message: "You can only send messages for your own reports." });
    }
    if (role === "authority" && String(report.pincode) !== String(userPincode)) {
      return res.status(403).json({ message: "You can only send messages regarding reports in your jurisdiction." });
    }

    // Determine sender_type
    let senderType = 'user';
    if (role === 'admin' || role === 'authority' || role === 'department_manager') {
       // Table enum is ('user', 'authority'). 
       // Only user and authority represent direct chat.
       senderType = role === 'user' ? 'user' : 'authority'; 
    } else {
       senderType = 'user';
    }

    await ReportMessage.create({
      reportId,
      senderType,
      senderId,
      message,
    });

    const messages = await ReportMessage.findByReportId(reportId);
    return res.status(201).json({ 
        message: "Message sent successfully", 
        newMessage: messages[messages.length - 1] 
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ message: "Server error while sending message" });
  }
};
