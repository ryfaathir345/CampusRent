// src/controllers/chat.controller.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// Middleware manual/helper untuk cek partisipan (Peminjam / Owner)
const checkParticipant = (transaction, userId) => {
  return transaction.borrowerId === userId || transaction.item.ownerId === userId;
};

// GET /api/chat/conversations
// Mendapatkan daftar percakapan user
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Ambil semua transaksi dimana user adalah peminjam ATAU pemilik barang
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { borrowerId: userId },
        { item: { ownerId: userId } }
      ]
    },
    include: {
      item: true,
      borrower: { select: { id: true, nama: true, fotoProfil: true } },
      item: {
        include: {
          owner: { select: { id: true, nama: true, fotoProfil: true } }
        }
      },
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const validStatuses = ['INQUIRY', 'APPROVED', 'BORROWED', 'RETURNED', 'COMPLETED'];
  
  // Memastikan percakapan diinisialisasi jika belum ada
  const formatted = transactions
    .filter(tx => validStatuses.includes(tx.status))
    .map(tx => {
      const isOwner = tx.item.ownerId === userId;
      const partner = isOwner ? tx.borrower : tx.item.owner;
      
      return {
        transactionId: tx.id,
        item: tx.item,
        partner,
        status: tx.status,
        conversationId: tx.conversation?.id || null,
        lastMessage: tx.conversation?.messages[0] || null
      };
    });

  return successResponse(res, 200, 'Berhasil memuat daftar obrolan', formatted);
});

// GET /api/chat/:transactionId/messages
// Mendapatkan pesan dalam suatu transaksi (buat conversation otomatis jika belum ada)
const getMessages = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const userId = req.user.id;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { item: true, conversation: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (!checkParticipant(transaction, userId)) return errorResponse(res, 403, 'Akses ditolak');

  const validStatuses = ['INQUIRY', 'APPROVED', 'BORROWED', 'RETURNED', 'COMPLETED'];
  if (!validStatuses.includes(transaction.status)) {
    return errorResponse(res, 403, 'Chat hanya tersedia untuk transaksi inquiry atau setelah disetujui');
  }

  let conversation = transaction.conversation;
  
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { transactionId }
    });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, nama: true, fotoProfil: true } }
    }
  });

  const formattedMessages = messages.map(msg => {
    if (msg.isDeleted) {
      return {
        ...msg,
        text: null,
        imageUrl: null,
        latitude: null,
        longitude: null,
      };
    }
    return msg;
  });

  return successResponse(res, 200, 'Berhasil memuat pesan', formattedMessages);
});

// POST /api/chat/:transactionId/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { text, type, latitude, longitude } = req.body;
  const userId = req.user.id;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { item: true, conversation: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (!checkParticipant(transaction, userId)) return errorResponse(res, 403, 'Akses ditolak');

  const validStatuses = ['INQUIRY', 'APPROVED', 'BORROWED', 'RETURNED', 'COMPLETED'];
  if (!validStatuses.includes(transaction.status)) {
    return errorResponse(res, 403, 'Chat hanya tersedia untuk transaksi inquiry atau setelah disetujui');
  }

  let conversation = transaction.conversation;
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { transactionId }
    });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  const messageType = type || (imageUrl ? 'IMAGE' : (latitude && longitude ? 'LOCATION' : 'TEXT'));

  if (messageType === 'TEXT' && (!text || text.trim() === '')) {
    return errorResponse(res, 400, 'Pesan tidak boleh kosong');
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      type: messageType,
      text: text || null,
      imageUrl,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null
    },
    include: {
      sender: { select: { id: true, nama: true, fotoProfil: true } }
    }
  });

  // Kirim notifikasi ke lawan bicara
  const partnerId = transaction.borrowerId === userId ? transaction.item.ownerId : transaction.borrowerId;
  await prisma.notification.create({
    data: {
      userId: partnerId,
      title: 'Pesan Baru',
      message: `Anda mendapat pesan baru terkait barang ${transaction.item.namaBarang}`
    }
  });

  return successResponse(res, 201, 'Pesan terkirim', message);
});

// DELETE /api/chat/:transactionId/messages/:messageId
const deleteMessage = asyncHandler(async (req, res) => {
  const { transactionId, messageId } = req.params;
  const userId = req.user.id;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { item: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (!checkParticipant(transaction, userId)) return errorResponse(res, 403, 'Akses ditolak');

  const message = await prisma.message.findUnique({
    where: { id: messageId }
  });

  if (!message) return errorResponse(res, 404, 'Pesan tidak ditemukan');
  if (message.senderId !== userId) return errorResponse(res, 403, 'Hanya pengirim yang dapat menghapus pesan ini');

  await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true }
  });

  return successResponse(res, 200, 'Pesan berhasil dihapus');
});

// PUT /api/chat/:transactionId/messages/read
const markAsRead = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const userId = req.user.id;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { item: true, conversation: true }
  });

  if (!transaction) return errorResponse(res, 404, 'Transaksi tidak ditemukan');
  if (!checkParticipant(transaction, userId)) return errorResponse(res, 403, 'Akses ditolak');

  if (transaction.conversation) {
    await prisma.message.updateMany({
      where: {
        conversationId: transaction.conversation.id,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });
  }

  return successResponse(res, 200, 'Pesan ditandai sudah dibaca');
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead
};
