# CubeSigner Snaps

This repository hosts the [CubeSigner Snap](./packages/snap) and a [demo
site](./packages/site) using the snap to sign transactions across different
chains (EVM, Solana, and Bitcoin).

CubeSigner is a hardware-backed, non-custodial platform for securely managing
cryptographic keys. The CubeSigner Snap uses the [CubeSigner TypeScript
SDK](https://github.com/cubist-labs/CubeSigner-TypeScript-SDK) to let your
MetaMask users sign transactions on EVM-based chains like Ethereum, Avalanche,
and Polygon, and on non-EVM chains like Bitcoin and Solana.

To use the snap you need a CubeSigner account: [contact us to get
started](https://cubist.dev/contact-form-cubesigner-hardware-backed-key-management).

### CubeSigner background

[The Cubist team](https://cubist.dev/about) built CubeSigner to address the key
security vs key availability tradeoff: right now, many teams are forced to keep
keys available in memory and therefore exposed to attackers, or try to keep
keys safe—usually only at rest—at serious latency and engineering cost.
CubeSigner addresses this problem by giving developers low-latency access to
hardware-backed key generation and signing. During each of these operations,
CubeSigner safeguards their users' keys in HSM-sealed Nitro Enclaves—combining
cold wallet security with hot wallet speed and simplicity.

Right now, the CubeSigner Snap supports signing for EVM chains like Ethereum
and Avalanche, and non-EVM chains Bitcoin and Solana. Support for more chains
and more features is in the works!

You can watch the CubeSigner Snap used with our demo site here:

https://github.com/cubist-labs/CubeSigner-Snap/assets/374012/ce61dc1a-ec81-4a4a-9d4b-886588ac77a9

## Getting Started

### Prerequisites

- Install Node.js v19
- Log into your CubeSigner organization using the `cs` command-line
  tool, e.g.,

  ```bash
  cs login owner@example.com --env '<gamma|prod|...>'
  ```

### Build

```bash
npm install
npm run build
```

### Run Tests

```bash
npm test
```

### Accessing the Snap

1. Start the snap

   ```bash
   npm -C packages/snap run start
   ```

2. Start the demo website

   ```bash
   npm -C packages/site run start
   ```

3. Navigate to `http://localhost:8000` and connect to MetaMask.

4. Click the `Log into CubeSigner` button

   The CubeSigner Snap will display a dialog to let you enter your CubeSigner
   signer session token. (Never paste your session token anywhere else!)

   To generate a new token for an existing role, run the following
   command from your terminal:

   ```bash
   cs token create --purpose "Snap demo" --role-id $ROLE_ID --output base64
   ```

   Copy the token and paste it into the snap dialog (and then clear your
   clipboard).

   You are now logged in and can sign and send transactions with the keys the token
   gives you access to!
