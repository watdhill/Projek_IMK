const fs = require('fs');
const path = require('path');
const db = require('./db');

async function migrate() {
  try {
    console.log('Menghubungkan ke database MySQL...');
    await db.sequelize.authenticate();
    console.log('Koneksi berhasil. Membuat tabel...');
    
    // Buat tabel yang belum ada tanpa menghapus data existing.
    await db.sequelize.sync({ force: process.env.MIGRATE_FORCE === 'true' });
    console.log('Tabel berhasil dibuat.');

    // Membaca data.json
    const DATA_FILE = path.join(__dirname, 'data.json');
    if (!fs.existsSync(DATA_FILE)) {
      console.log('File data.json tidak ditemukan! Migrasi dihentikan.');
      process.exit();
    }

    console.log('Membaca data.json...');
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(rawData);

    // 1. Profile
    if (data.profile) await db.Profile.create(data.profile);
    
    // 2. Contact
    if (data.contact) await db.Contact.create(data.contact);

    // 3. PeminjamanSetting
    if (data.peminjamanSettings) await db.PeminjamanSetting.create(data.peminjamanSettings);

    // 4. Users
    if (data.users && data.users.length > 0) {
      await db.User.bulkCreate(data.users);
    }

    // 5. Divisions
    if (data.divisions && data.divisions.length > 0) {
      await db.Division.bulkCreate(data.divisions);
    }

    // 6. Members
    if (data.members && data.members.length > 0) {
      await db.Member.bulkCreate(data.members);
    }

    // 7. Programs
    if (data.programs && data.programs.length > 0) {
      await db.Program.bulkCreate(data.programs);
    }

    // 8. Slides
    if (data.slides && data.slides.length > 0) {
      await db.Slide.bulkCreate(data.slides);
    }

    // 9. Finances
    if (data.finances && data.finances.length > 0) {
      await db.Finance.bulkCreate(data.finances.map(f => ({
        ...f,
        amount: Number(f.amount) || 0
      })));
    }

    // 10. Inventory
    if (data.inventory && data.inventory.length > 0) {
      await db.Inventory.bulkCreate(data.inventory.map(i => ({
        ...i,
        stock: Number(i.stock) || 0
      })));
    }

    // 11. Anggota
    if (data.anggota && data.anggota.length > 0) {
      await db.Anggota.bulkCreate(data.anggota.map(a => ({
        ...a,
        join_year: Number(a.join_year) || 0
      })));
    }

    // 12. Peminjaman
    if (data.peminjaman && data.peminjaman.length > 0) {
      await db.Peminjaman.bulkCreate(data.peminjaman.map(p => ({
        ...p,
        totalPrice: Number(p.totalPrice) || 0
      })));
    }

    // 13. Prestasi
    if (data.prestasiList && data.prestasiList.length > 0) {
      await db.Prestasi.bulkCreate(data.prestasiList);
    }

    // 14. VisitorLogs
    if (data.visitorLogs && data.visitorLogs.length > 0) {
      await db.VisitorLog.bulkCreate(data.visitorLogs);
    }

    // 15. Gallery
    if (data.gallery && data.gallery.length > 0) {
      await db.Gallery.bulkCreate(data.gallery);
    }

    console.log('🎉 Migrasi dari data.json ke MySQL berhasil!');
    process.exit();
  } catch (error) {
    console.error('Terjadi kesalahan saat migrasi:', error);
    process.exit(1);
  }
}

migrate();
