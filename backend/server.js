import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from './config/database.js';
import User from './models/User.js';
import Asset from './models/Asset.js';
import Commitment from './models/Commitment.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'aether-secret-key-12345';

app.use(cors());
app.use(express.json());

// Seeding function for assets
async function seedAssets() {
  const count = await Asset.count();
  if (count === 0) {
    const now = Date.now();
    const mockAssets = [
      {
        id: '0x8F9B62A1',
        name: 'Project Obsidian',
        description: 'Artefak inti data obsidian futuristik dengan enkripsi tingkat tinggi yang disimpan secara on-chain pada jaringan Aether. Memberikan hak suara khusus pada protokol.',
        currentBid: 0.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWHjqT8HLHCA8AhPu87mfvbHnsRBe2wG1VRLjpBL51PpRCMFBlvVoq0QojUFnS6dfTVaJbqmaXBFfcAdMzzG8uSVERYQJ1x1jVtsCULS2_J_3cjha1x4o5a3Ccf80V5mAwoG1h95f4gaOBX3o_jrz4-TiZjnsM-oAjOl-mCsp7W3PdbZXCDjDnJYQTgKqtyMbvhscuubcEtaunW_UZrukea8Oq43dVJrycJ8K87j4BxoAIzDtNIVyKPHfusV5mUjPvhI-3EmTmwfB3',
        views: '1.2k',
        type: 'Core Data',
        standard: 'ERC-721',
        biddingEnd: new Date(now + 2 * 3600 * 1000 + 14 * 60 * 1000 + 59 * 1000), // 02:14:59
        revealEnd: new Date(now + 6 * 3600 * 1000),
        ended: false
      },
      {
        id: '0x3B2C9C4A',
        name: 'Quantum Node Alpha',
        description: 'Prosesor komputasi kuantum canggih dengan sirkuit neon biru yang merepresentasikan daya komputasi node konsorsium. Akses instan ke jaringan komputasi terdistribusi.',
        currentBid: 0.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiFDoBvEXsRn0_xMMqMAgKG8bwuJNjj2wrio375LkDGnvF1-7kzM67ykNRKzw9QNWahiGSQJ7vKNZ0Yhm6j5gxgfWxfF2zpONqfIIz0Qy_lV2UnZim5dNVkymLmHi4md-YYjS7LD5Hc8j7hrwyjs1RY70-PctS_jr6GPcl26PMtJr7uLxcz5nkFd0ZgnJaqDLF0CfbFX0Ma7MMewIuCpoKZcsKd_L7_IyBuNAxQ2mzZf20NOn1Y_Mjh6weU-GclvcMvb_21iyJBhbL',
        views: '840',
        type: 'Quantum CPU',
        standard: 'ERC-1155',
        biddingEnd: new Date(now + 0 * 3600 * 1000 + 45 * 60 * 1000 + 12 * 1000), // 00:45:12
        revealEnd: new Date(now + 4 * 3600 * 1000),
        ended: false
      },
      {
        id: '0x1A8D7F0E',
        name: 'Ether Grid Parcel 09',
        description: 'Lahan real estate digital mengambang yang terstruktur rapi pada jaringan metaverse Aether, siap lelang dengan sisa waktu kritis. Hak kepemilikan node virtual.',
        currentBid: 0.00,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFaVvkLnqEsue1Vsp2HuVxh2-bXnPyL0kGW5GJgcca7H02lTaQbV3HEF_YLZ7sm7kL2HGX0cuGD2EXxwbXvozlnRdJuhrHVlH4pD62a0jydQ98Aq1lv0yJuK2yuP3NaWqlk7pc-FhBrCn6zBZxB9c8-BbWvmB1_jn3JPi4fJVv2lFC7VXeChaAjkds6NukNYOIkyUSLbgh1nUjNQ92fwDWSB_JGI2GF_2ylZKA0dzW7F0_SXwMN8yZ6KhCopn-uzO2fbfEnxVhKAuv',
        views: '2.5k',
        type: 'Real Estate',
        standard: 'ERC-721',
        biddingEnd: new Date(now + 0 * 3600 * 1000 + 2 * 60 * 1000 + 34 * 1000), // 00:02:34
        revealEnd: new Date(now + 2 * 3600 * 1000),
        ended: false
      }
    ];
    await Asset.bulkCreate(mockAssets);
    console.log('Mock assets successfully seeded.');
  }
}

// Routes
// 1. Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nim, password, username, walletAddress } = req.body;
    if (!nim || !password) {
      return res.status(400).json({ error: 'NIM dan Password wajib diisi' });
    }

    const existingUser = await User.findByPk(nim);
    if (existingUser) {
      return res.status(400).json({ error: 'Identitas NIM sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      nim,
      password: hashedPassword,
      username: username || `User-${nim}`,
      walletAddress: walletAddress || null
    });

    const token = jwt.sign({ nim: user.nim }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        nim: user.nim,
        username: user.username,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { nim, password } = req.body;
    if (!nim || !password) {
      return res.status(400).json({ error: 'NIM dan Password wajib diisi' });
    }

    const user = await User.findByPk(nim);
    if (!user) {
      return res.status(400).json({ error: 'Kredensial salah atau NIM tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Kredensial salah atau Password tidak cocok' });
    }

    const token = jwt.sign({ nim: user.nim }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login berhasil',
      token,
      user: {
        nim: user.nim,
        username: user.username,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

app.post('/api/auth/update-wallet', async (req, res) => {
  try {
    const { nim, walletAddress } = req.body;
    if (!nim || !walletAddress) {
      return res.status(400).json({ error: 'NIM dan Wallet Address wajib diisi' });
    }

    const user = await User.findByPk(nim);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    user.walletAddress = walletAddress;
    await user.save();

    res.json({
      message: 'Wallet address berhasil diperbarui',
      user: {
        nim: user.nim,
        username: user.username,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
});

// 2. Asset routes
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.findAll();
    res.json(assets);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Gagal mengambil data aset lelang' });
  }
});

app.get('/api/assets/:id', async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Aset tidak ditemukan' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Gagal mengambil data aset' });
  }
});

app.put('/api/assets/:id/bid', async (req, res) => {
  try {
    const { currentBid } = req.body;
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Aset tidak ditemukan' });
    }

    if (currentBid > asset.currentBid) {
      asset.currentBid = currentBid;
      await asset.save();
    }

    res.json({
      message: 'Current bid berhasil diperbarui',
      asset
    });
  } catch (error) {
    console.error('Update bid error:', error);
    res.status(500).json({ error: 'Gagal memperbarui penawaran tertinggi' });
  }
});

// 3. Commitment routes
app.post('/api/commitments', async (req, res) => {
  try {
    const { assetId, walletAddress, commitmentHash } = req.body;
    if (!assetId || !walletAddress || !commitmentHash) {
      return res.status(400).json({ error: 'Data komitmen tidak lengkap' });
    }

    const commitment = await Commitment.create({
      assetId,
      walletAddress,
      commitmentHash
    });

    res.status(201).json({
      message: 'Komitmen berhasil dicatat secara publik',
      commitment
    });
  } catch (error) {
    console.error('Create commitment error:', error);
    res.status(500).json({ error: 'Gagal mencatat komitmen' });
  }
});

app.get('/api/commitments', async (req, res) => {
  try {
    const commitments = await Commitment.findAll({
      order: [['timestamp', 'DESC']]
    });
    res.json(commitments);
  } catch (error) {
    console.error('Get commitments error:', error);
    res.status(500).json({ error: 'Gagal mengambil log komitmen' });
  }
});

app.get('/api/commitments/user/:walletAddress', async (req, res) => {
  try {
    const commitments = await Commitment.findAll({
      where: { walletAddress: req.params.walletAddress },
      order: [['timestamp', 'DESC']]
    });
    res.json(commitments);
  } catch (error) {
    console.error('Get user commitments error:', error);
    res.status(500).json({ error: 'Gagal mengambil log komitmen pengguna' });
  }
});

// Start server
sequelize.sync().then(async () => {
  await seedAssets();
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the SQLite database:', err);
});
