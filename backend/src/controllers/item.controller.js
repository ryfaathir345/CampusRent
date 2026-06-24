// src/controllers/item.controller.js
const fs = require('fs');
const path = require('path');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

// GET /api/items
const getItems = asyncHandler(async (req, res) => {
  const { search, kategori, status, ownerId, universitas, lat, lng, radius } = req.query;

  const where = {};
  if (search) {
    where.namaBarang = { contains: search };
  }
  if (kategori) {
    where.kategori = kategori;
  }
  if (status) {
    where.statusBarang = status;
  }
  if (ownerId) {
    where.ownerId = ownerId;
  }
  if (universitas) {
    where.owner = {
      universitas: { contains: universitas }
    };
  }
  
  // Jangan tampilkan barang yang di-ban kecuali dipanggil oleh admin (tapi ini rute publik, jadi selau false)
  where.isBanned = false;

  let items = await prisma.item.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { id: true, nama: true, fotoProfil: true, universitas: true }
      }
    }
  });

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = radius ? parseFloat(radius) : 10; // default 10km

    items = items.map(item => {
      const distance = calculateDistance(userLat, userLng, item.latitude, item.longitude);
      return { ...item, distance };
    }).filter(item => item.distance === null || item.distance <= maxRadius)
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }

  return successResponse(res, 200, 'Berhasil mengambil daftar barang', items);
});

// GET /api/items/:id
const getItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await prisma.item.update({
    where: { id },
    data: {
      viewCount: { increment: 1 }
    },
    include: {
      owner: {
        select: { id: true, nama: true, jurusan: true, universitas: true, whatsapp: true, email: true, fotoProfil: true }
      }
    }
  });

  if (!item) {
    return errorResponse(res, 404, 'Barang tidak ditemukan');
  }

  return successResponse(res, 200, 'Berhasil mengambil detail barang', item);
});

// POST /api/items
const createItem = asyncHandler(async (req, res) => {
  const { namaBarang, kategori, deskripsi, kondisiBarang, lokasiPengambilan, maksimalHariPinjam, hargaSewa, stok, latitude, longitude } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user.isVerified) {
    return errorResponse(res, 403, 'Anda harus melakukan verifikasi KTM terlebih dahulu sebelum menyewakan barang');
  }

  let fotoBarang = null;
  if (req.files && req.files.length > 0) {
    fotoBarang = req.files.map(file => `/uploads/${file.filename}`).join(',');
  } else if (req.file) { // Fallback if using single upload in some cases
    fotoBarang = `/uploads/${req.file.filename}`;
  }

  const parsedStok = parseInt(stok);
  const finalStok = isNaN(parsedStok) ? 1 : parsedStok;

  const item = await prisma.item.create({
    data: {
      namaBarang,
      kategori,
      deskripsi,
      kondisiBarang,
      lokasiPengambilan,
      maksimalHariPinjam: parseInt(maksimalHariPinjam) || 1,
      hargaSewa: parseInt(String(hargaSewa).replace(/\D/g, '')) || 0,
      stok: finalStok,
      statusBarang: finalStok > 0 ? 'TERSEDIA' : 'DIPINJAM',
      fotoBarang,
      ownerId: userId,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null
    }
  });

  return successResponse(res, 201, 'Barang berhasil ditambahkan', item);
});

// PATCH /api/items/:id
const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { namaBarang, kategori, deskripsi, kondisiBarang, lokasiPengambilan, maksimalHariPinjam, hargaSewa, statusBarang, stok, latitude, longitude } = req.body;

  const existingItem = await prisma.item.findUnique({ where: { id } });
  if (!existingItem) {
    return errorResponse(res, 404, 'Barang tidak ditemukan');
  }

  if (existingItem.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
    return errorResponse(res, 403, 'Akses ditolak. Anda bukan pemilik barang ini.');
  }

  const updateData = {
    ...(namaBarang && { namaBarang }),
    ...(kategori && { kategori }),
    ...(deskripsi && { deskripsi }),
    ...(kondisiBarang && { kondisiBarang }),
    ...(lokasiPengambilan && { lokasiPengambilan }),
    ...(maksimalHariPinjam && { maksimalHariPinjam: parseInt(maksimalHariPinjam) }),
    ...(hargaSewa !== undefined && { hargaSewa: parseInt(String(hargaSewa).replace(/\D/g, '')) || 0 }),
    ...(statusBarang && { statusBarang }),
    ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
    ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null })
  };

  if (stok !== undefined) {
    const finalStok = parseInt(stok) || 0;
    updateData.stok = finalStok;
    if (finalStok <= 0) updateData.statusBarang = 'DIPINJAM';
    else if (!statusBarang) updateData.statusBarang = 'TERSEDIA';
  }

  if (req.files && req.files.length > 0) {
    updateData.fotoBarang = req.files.map(file => `/uploads/${file.filename}`).join(',');
    // Optionally delete old photos
    if (existingItem.fotoBarang) {
      existingItem.fotoBarang.split(',').forEach(photo => {
        try {
          const oldPath = path.join(__dirname, '../../public', photo.trim());
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (error) {
          console.error('Error deleting old photo:', error);
        }
      });
    }
  } else if (req.file) {
    updateData.fotoBarang = `/uploads/${req.file.filename}`;
    if (existingItem.fotoBarang) {
      existingItem.fotoBarang.split(',').forEach(photo => {
        try {
          const oldPath = path.join(__dirname, '../../public', photo.trim());
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (error) {
          console.error('Error deleting old photo:', error);
        }
      });
    }
  }

  const updatedItem = await prisma.item.update({
    where: { id },
    data: updateData
  });

  return successResponse(res, 200, 'Barang berhasil diperbarui', updatedItem);
});

// DELETE /api/items/:id
const deleteItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingItem = await prisma.item.findUnique({ where: { id } });
  if (!existingItem) {
    return errorResponse(res, 404, 'Barang tidak ditemukan');
  }

  if (existingItem.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
    return errorResponse(res, 403, 'Akses ditolak. Anda bukan pemilik barang ini.');
  }

  await prisma.item.delete({ where: { id } });

  // Delete associated photos
  if (existingItem.fotoBarang) {
    existingItem.fotoBarang.split(',').forEach(photo => {
      try {
        const oldPath = path.join(__dirname, '../../public', photo.trim());
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    });
  }

  return successResponse(res, 200, 'Barang berhasil dihapus');
});

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem };
