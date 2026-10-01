const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME || 'db_imk_unand', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  dialect: 'mysql',
  logging: false, // Matikan log SQL agar terminal bersih
});

// 1. Profile (Singleton)
const Profile = sequelize.define('Profile', {
  name: { type: DataTypes.STRING, defaultValue: '' },
  description: { type: DataTypes.TEXT },
  visi: { type: DataTypes.TEXT },
  misi: { type: DataTypes.TEXT },
  visiMisi: { type: DataTypes.TEXT },
  prestasi: { type: DataTypes.TEXT },
  struktur: { type: DataTypes.TEXT },
});

// 2. Contact (Singleton)
const Contact = sequelize.define('Contact', {
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  instagram: { type: DataTypes.STRING },
  facebook: { type: DataTypes.STRING },
  website: { type: DataTypes.STRING },
});

// 3. Users
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  division_key: { type: DataTypes.STRING, allowNull: true },
});

// 4. Members (Pengurus)
const Member = sequelize.define('Member', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  division_key: { type: DataTypes.STRING },
});

// 5. Divisions
const Division = sequelize.define('Division', {
  key: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  avatar: { type: DataTypes.STRING },
});

// 6. Programs
const Program = sequelize.define('Program', {
  id: { type: DataTypes.STRING, primaryKey: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  execution_date: { type: DataTypes.STRING },
  penanggung_jawab: { type: DataTypes.STRING },
  division_key: { type: DataTypes.STRING },
});

// 7. Slides
const Slide = sequelize.define('Slide', {
  id: { type: DataTypes.STRING, primaryKey: true },
  src: { type: DataTypes.STRING },
  caption: { type: DataTypes.STRING },
});

// 8. Finances
const Finance = sequelize.define('Finance', {
  id: { type: DataTypes.STRING, primaryKey: true },
  type: { type: DataTypes.STRING },
  amount: { type: DataTypes.DECIMAL(15, 2) },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.STRING },
});

// 9. Inventory
const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  condition: { type: DataTypes.STRING, defaultValue: 'baik' },
  location: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
});

// 10. Anggota (Database Anggota)
const Anggota = sequelize.define('Anggota', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  nim: { type: DataTypes.STRING },
  program_study: { type: DataTypes.STRING },
  join_year: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING },
  division_key: { type: DataTypes.STRING },
});

// 11. Peminjaman
const Peminjaman = sequelize.define('Peminjaman', {
  id: { type: DataTypes.STRING, primaryKey: true },
  itemId: { type: DataTypes.STRING },
  itemName: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  noHp: { type: DataTypes.STRING },
  instansi: { type: DataTypes.STRING },
  startDate: { type: DataTypes.STRING },
  endDate: { type: DataTypes.STRING },
  totalPrice: { type: DataTypes.DECIMAL(15, 2) },
  suratUrl: { type: DataTypes.STRING },
  buktiUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.STRING },
});

// 12. Prestasi
const Prestasi = sequelize.define('Prestasi', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  level: { type: DataTypes.STRING },
  year: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
});

// 13. VisitorLogs
const VisitorLog = sequelize.define('VisitorLog', {
  id: { type: DataTypes.STRING, primaryKey: true },
  ip: { type: DataTypes.STRING },
  path: { type: DataTypes.STRING },
  userAgent: { type: DataTypes.TEXT },
  timestamp: { type: DataTypes.STRING },
});

// 14. Gallery
const Gallery = sequelize.define('Gallery', {
  id: { type: DataTypes.STRING, primaryKey: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  coverImage: { type: DataTypes.STRING },
  image: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  photos: { type: DataTypes.JSON }, // MySQL mendukung JSON
});

// 15. PeminjamanSettings
const PeminjamanSetting = sequelize.define('PeminjamanSetting', {
  bank: { type: DataTypes.STRING },
  rek: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
});

module.exports = {
  sequelize,
  Profile,
  Contact,
  User,
  Member,
  Division,
  Program,
  Slide,
  Finance,
  Inventory,
  Anggota,
  Peminjaman,
  Prestasi,
  VisitorLog,
  Gallery,
  PeminjamanSetting
};
