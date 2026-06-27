const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    const itemCounts = await prisma.item.groupBy({
      by: ['kategori'],
      _count: { kategori: true }
    });

    const categoryMap = {};
    itemCounts.forEach(c => {
      // Use uppercase for case-insensitive matching (MySQL might return title case if it was inserted that way)
      const key = (c.kategori || '').toUpperCase();
      categoryMap[key] = (categoryMap[key] || 0) + c._count.kategori;
    });

    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      itemCount: categoryMap[cat.name.toUpperCase()] || 0
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Create a new category (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }

    // Check if exists
    const existing = await prisma.category.findUnique({
      where: { name }
    });

    if (existing) {
      return res.status(400).json({ message: 'Kategori sudah ada' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || 'category'
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Delete category (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is used by items (we store name in items, so we'd have to check if any item uses this name)
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    const usedItems = await prisma.item.findFirst({
      where: { kategori: category.name }
    });

    if (usedItems) {
      return res.status(400).json({ message: 'Kategori tidak bisa dihapus karena sedang digunakan oleh barang.' });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
