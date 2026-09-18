
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Report, Zone } = require('./models');

const PASSWORD = 'password123'; // demo password for every seeded account

const users = [
  { name: 'Ahmed Ben Ali',    email: 'ahmed.benali@example.com',     role: 'citizen' },
  { name: 'Salma Gharbi',     email: 'salma.gharbi@example.com',     role: 'citizen' },
  { name: 'Mohamed Trabelsi', email: 'mohamed.trabelsi@example.com', role: 'citizen' },
  { name: 'Amira Kacem',      email: 'amira.kacem@example.com',      role: 'citizen' },
  { name: 'Khaled Jlassi',    email: 'khaled.jlassi@example.com',    role: 'citizen' },
  { name: 'Ines Bouaziz',     email: 'ines.bouaziz@example.com',     role: 'citizen' },
  { name: 'Yassine Mejri',    email: 'yassine.mejri@example.com',    role: 'citizen' },
  { name: 'Narjes Hammami',   email: 'narjes.hammami@example.com',   role: 'citizen' },
  { name: 'Fatma Cherif',     email: 'agent.tunis@cityfix.tn',       role: 'agent'   },
  { name: 'Riadh Saidi',      email: 'agent.sfax@cityfix.tn',        role: 'agent'   },
];

// byEmail links each report to a citizen above. Coordinates cover all regions of Tunisia.
const reports = [
  { byEmail:'ahmed.benali@example.com',    city:'Tunis',           lat:36.8065, lng:10.1815, title:'Large pothole on Habib Bourguiba Ave',     category:'pothole',    status:'in_progress' },
  { byEmail:'ahmed.benali@example.com',    city:'Ariana',          lat:36.8625, lng:10.1956, title:'Streetlight flickering near mosque',        category:'streetlight', status:'pending' },
  { byEmail:'ahmed.benali@example.com',    city:'Beja',            lat:36.7256, lng:9.1817,  title:'Garbage scattered on market street',        category:'garbage',     status:'pending' },
  { byEmail:'salma.gharbi@example.com',    city:'La Marsa',        lat:36.8835, lng:10.3247, title:'Open garbage pile on Sidi Bou Said road',  category:'garbage',     status:'pending' },
  { byEmail:'salma.gharbi@example.com',    city:'Carthage',        lat:36.8544, lng:10.3317, title:'Graffiti covering public sign',            category:'other',       status:'resolved' },
  { byEmail:'salma.gharbi@example.com',    city:'Siliana',         lat:36.0872, lng:9.3748,  title:'Pothole on national road RN4',             category:'pothole',     status:'pending' },
  { byEmail:'mohamed.trabelsi@example.com',city:'Ben Arous',       lat:36.7533, lng:10.2189, title:'Pothole at roundabout exit',               category:'pothole',     status:'pending' },
  { byEmail:'mohamed.trabelsi@example.com',city:'Sousse',          lat:35.8256, lng:10.6084, title:'Streetlight out on Boulevard',             category:'streetlight', status:'in_progress' },
  { byEmail:'mohamed.trabelsi@example.com',city:'Tunis Medina',    lat:36.7996, lng:10.1724, title:'Pothole in souk street',                   category:'pothole',     status:'pending' },
  { byEmail:'amira.kacem@example.com',     city:'Nabeul',          lat:36.4561, lng:10.7356, title:'Sinkhole on coastal road',                 category:'pothole',     status:'pending' },
  { byEmail:'amira.kacem@example.com',     city:'Hammamet',        lat:36.4016, lng:10.6063, title:'Dumping next to beach access',             category:'garbage',     status:'resolved' },
  { byEmail:'amira.kacem@example.com',     city:'Tozeur',          lat:33.9197, lng:8.1335,  title:'Garbage near palm grove entrance',         category:'garbage',     status:'pending' },
  { byEmail:'khaled.jlassi@example.com',   city:'Bizerte',         lat:37.2744, lng:9.8739,  title:'Garbage not collected for 2 weeks',        category:'garbage',     status:'in_progress' },
  { byEmail:'khaled.jlassi@example.com',   city:'Mateur',          lat:37.0394, lng:9.6627,  title:'Broken streetlight on main road',          category:'streetlight', status:'pending' },
  { byEmail:'khaled.jlassi@example.com',   city:'Tataouine',       lat:32.9292, lng:10.4491, title:'Streetlight works only intermittently',    category:'streetlight', status:'resolved' },
  { byEmail:'khaled.jlassi@example.com',   city:'Gafsa',           lat:34.4250, lng:8.7842,  title:'Streetlight out in Kasbah district',       category:'streetlight', status:'pending' },
  { byEmail:'ines.bouaziz@example.com',    city:'Monastir',        lat:35.7780, lng:10.8262, title:'Pothole on avenue Habib Bourguiba',        category:'pothole',     status:'pending' },
  { byEmail:'ines.bouaziz@example.com',    city:'Mahdia',          lat:35.5047, lng:11.0622, title:'Garbage spill near medina gate',           category:'garbage',     status:'pending' },
  { byEmail:'ines.bouaziz@example.com',    city:'Sidi Bouzid',     lat:35.0382, lng:9.4857,  title:'Broken water drainage grate',              category:'other',       status:'pending' },
  { byEmail:'yassine.mejri@example.com',   city:'Kairouan',        lat:35.6781, lng:10.0963, title:'Streetlight out near great mosque',        category:'streetlight', status:'in_progress' },
  { byEmail:'yassine.mejri@example.com',   city:'Zaghouan',        lat:36.4013, lng:10.1434, title:'Broken public bench in park',              category:'other',       status:'pending' },
  { byEmail:'yassine.mejri@example.com',   city:'Kebili',          lat:33.7051, lng:8.9691,  title:'Broken playground swing',                  category:'other',       status:'pending' },
  { byEmail:'yassine.mejri@example.com',   city:'Jendouba',        lat:36.5011, lng:8.7803,  title:'Pothole near bus station',                 category:'pothole',     status:'pending' },
  { byEmail:'narjes.hammami@example.com',  city:'Sfax',            lat:34.7406, lng:10.7603, title:'Deep pothole in front of school',          category:'pothole',     status:'in_progress' },
  { byEmail:'narjes.hammami@example.com',  city:'Sfax Port',       lat:34.7242, lng:10.7733, title:'Collapsed drain cover',                    category:'other',       status:'resolved' },
  { byEmail:'narjes.hammami@example.com',  city:'Gabes',           lat:33.8869, lng:10.0975, title:'Open garbage dump near market',            category:'garbage',     status:'in_progress' },
  { byEmail:'narjes.hammami@example.com',  city:'Medenine',        lat:33.3547, lng:10.5053, title:'Pothole on road to Djerba',                category:'pothole',     status:'pending' },
  { byEmail:'narjes.hammami@example.com',  city:'Le Kef',          lat:36.1773, lng:8.7046,  title:'Streetlight damaged by storm',             category:'streetlight', status:'pending' },
  { byEmail:'amira.kacem@example.com',     city:'Djerba',          lat:33.8869, lng:10.8576, title:'Garbage pile on Houmt Souk beach',         category:'garbage',     status:'resolved' },
  { byEmail:'mohamed.trabelsi@example.com',city:'Sousse Corniche', lat:35.8398, lng:10.6282, title:'Garbage bins overflowing on corniche',     category:'garbage',     status:'in_progress' },
];


const zones = [
  {
    name: 'Tunis area', color: '#dc2626',
    boundary: { type: 'Polygon', coordinates: [[
      [10.05,36.70],[10.24,36.69],[10.36,36.78],[10.45,36.90],
      [10.28,36.96],[10.08,36.93],[10.00,36.82],[10.05,36.70],
    ]] },
  },
  {
    name: 'Sfax region', color: '#2563eb',
    boundary: { type: 'Polygon', coordinates: [[
      [10.60,34.65],[10.92,34.64],[10.97,34.78],[10.82,34.90],
      [10.60,34.88],[10.60,34.65],
    ]] },
  },
  {
    name: 'Sousse - Monastir coast', color: '#16a34a',
    boundary: { type: 'Polygon', coordinates: [[
      [10.50,35.70],[10.75,35.70],[10.95,35.82],[10.85,35.92],
      [10.58,35.88],[10.50,35.70],
    ]] },
  },
];

async function seed() {
  try {
    await sequelize.sync(); // make sure tables exist (same as server start)
    const hash = await bcrypt.hash(PASSWORD, 10);

    // 1) users -- findOrCreate by email so re-running the seed won't duplicate them
    const created = [];
    for (const u of users) {
      const [user, isNew] = await User.findOrCreate({
        where: { email: u.email },
        defaults: { ...u, password: hash },
      });
      if (isNew) console.log('+ user', u.email);
      created.push(user);
    }
    const emailToId = Object.fromEntries(created.map((u) => [u.email, u.id]));

    // 2) reports -- only seed if the table is empty
    if ((await Report.count()) === 0) {
      await Report.bulkCreate(
        reports.map((r) => ({
          title: r.title,
          description: `Reported in ${r.city}. ${r.title}.`,
          category: r.category,
          status: r.status,
          photoUrl: null,
          // PostGIS POINT (lng, lat) -- same GeoJSON shape Sequelize expects
          location: { type: 'Point', coordinates: [r.lng, r.lat] },
          userId: emailToId[r.byEmail],
        }))
      );
      console.log(`Seeded ${reports.length} reports across Tunisia.`);
    } else {
      console.log('Skipped reports: table not empty (delete them to reseed).');
    }

    // 3) zones -- only seed if the table is empty
    if ((await Zone.count()) === 0) {
      await Zone.bulkCreate(zones);
      console.log(`Seeded ${zones.length} zones.`);
    } else {
      console.log('Skipped zones: table not empty.');
    }

    console.log('Seed complete. Demo login: any seeded email / password123');
    await sequelize.close();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
