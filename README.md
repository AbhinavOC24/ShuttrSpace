# 📸 ShuttrSpace

**ShuttrSpace** is a full-stack photography platform that blends professional portfolio features with **Web3-powered content ownership**.  

Photographers can upload, manage, and share their work, with the option to store media on decentralized storage (IPFS) and publish metadata to the Solana blockchain for **verifiable, tamper-proof ownership records**.

---

## 🚀 Features

- **Portfolio-grade profiles** – Showcase work in a clean, professional layout
- **Wallet-based authentication** – Log in with a Solana wallet instead of email/password
- **Decentralized storage** – Store high-resolution images on **IPFS** for censorship resistance and global accessibility
- **On-chain publishing (optional)** – Push metadata CIDs to Solana for publicly verifiable authorship
- **Metadata signing** – Cryptographically sign image metadata with the uploader's private key to ensure authenticity
- **Image optimization** – Automatic thumbnail generation for faster gallery load times
- **Secure APIs** – Handle uploads, metadata, and profile data safely with access control

---

## 🛠 Tech Stack

### **Frontend**
- [Next.js](https://nextjs.org/) + Tailwind CSS
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- Client-side thumbnail generation via `<canvas>` or `sharp` (backend fallback)

### **Backend**
- Node.js + Express
- Prisma ORM + PostgreSQL
- CORS + secure session handling
- IPFS integration via [Web3.Storage](https://web3.storage/) or [Pinata](https://pinata.cloud/)

### **Web3 Components**
- **Blockchain**: Solana
- **Smart Contract Framework**: Anchor
- **Account Structure**:
  ```
  #[account]
  pub struct UserPortfolio {
      pub owner: Pubkey,
      pub items: Vec<String>, // metadata CIDs
  }
  ```

### **On-chain Instructions**
- `initializePortfolio()` → creates a PDA (Program Derived Address) portfolio account for the user
- `addPortfolioItem(metadata_cid)` → appends a new IPFS CID to the user's on-chain portfolio

### **Decentralized Storage**
- **Full-resolution image** → stored on IPFS
- **Thumbnail** → stored on IPFS for fast retrieval
- **Metadata JSON** → stored on IPFS containing:
  ```
  {
    "name": "Stormy Skies",
    "tags": ["landscape", "monsoon"],
    "author": "WalletAddress",
    "image": "ipfs://originalCID",
    "thumbnail": "ipfs://thumbnailCID",
    "signature": "signedHash"
  }
  ```

### **Verification**
- Metadata signature is validated using TweetNaCl to confirm that the uploader's wallet private key signed the file hash
- If verified, the profile displays a "Verified Author" badge

---

## 📦 Installation

```
# Clone the repo
git clone https://github.com/yourusername/shuttrspace.git
cd shuttrspace

# Install dependencies
npm install

# Create .env file (see .env.example for format)

# Run backend
cd backend
npm run dev

# Run frontend
cd frontend
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file in both `frontend/` and `backend/`:

### Backend
```
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=http://localhost:3000
BACKEND_PORT=5000
IPFS_API_KEY=your_key_here
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Frontend
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## 📌 Roadmap

- [ ] Infinite scroll galleries
- [ ] Bounty / challenge system with on-chain reward payouts
- [ ] Tipping system using Solana Pay
- [ ] Full on-chain profile and gallery management

---

## 📜 License

MIT License – feel free to use and adapt.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

If you have any questions or need help, please open an issue or reach out to the maintainers.

---

**Built with ❤️ for the decentralized photography community**
