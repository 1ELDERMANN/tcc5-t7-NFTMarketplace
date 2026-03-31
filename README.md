This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## NFT Marketplace (ProductNFT + Marketplace)

### 1. Prerequisites

- Node.js 20.9.0
- npm (or pnpm/yarn)
- MetaMask extension or wallet connected to Sepolia testnet
- Deployed contracts (already set in `app/admin/page.tsx` and `app/page.tsx`):
  - `ProductNFT` at `0x08546A0E68C0aBFbba28A554D6Ce120553854F8b`
  - `Marketplace` at `0x07Aa1f8E7Ac4323276D4F159dC889B9D7a44655E`

### 2. Run locally

```bash
npm install
nvm use 20.9.0
npm run dev
```

Open `http://localhost:3000`.

### 3. Admin flow (mint + list)

1. Open `/admin`.
2. Click **Connect Wallet** and authorize MetaMask (Sepolia).
3. Fill in product details:
   - Product Name
   - Category
   - Image URL
   - Price (ETH)
   - Quantity
4. Click **Deploy Product**.

The app will:
- mint NFT via `ProductNFT.mintProduct(name, category, tokenURI)`
- parse `ProductMinted` event for `tokenId`
- list via `Marketplace.listProduct(tokenId, ethers.parseEther(price), quantity)`

### 4. User flow (marketplace viewing + buy)

1. Open `/`.
2. The app fetches active items via `Marketplace.getAllActiveListings()`.
3. For each listing, it fetches product metadata via `ProductNFT.getProduct(tokenId)`.

### 5. Troubleshooting

- If you see `No contract found at MARKETPLACE_ADDR`: ensure MetaMask is on Sepolia.
- If you see `ProductNFT: unknown token`: tokenId must be minted first.
- If you see `price.toFixed is not a function`: verify `price` is numeric (applied as `parseFloat(ethers.formatEther(item.price))`).

### 6. Clean up deployment artifacts

Add to `.gitignore`:

```
contracts/broadcast/
contracts/cache/
```

Then remove from git index:

```bash
git rm -r --cached contracts/broadcast contracts/cache
```
