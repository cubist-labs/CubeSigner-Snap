# CubeSigner Snap

This package provides an interface to CubeSigner's remote services via
the MetaMasks's JSON-RPC snap API.

CubeSigner is a hardware-backed, non-custodial platform for securely managing
cryptographic keys. The CubeSigner Snap uses the [CubeSigner TypeScript
SDK](https://github.com/cubist-labs/CubeSigner-TypeScript-SDK) to let your
MetaMask users sign transactions on EVM-based chains like Ethereum, Avalanche,
and Polygon, and on non-EVM chains like Bitcoin and Solana.

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

## JSON-RPC methods

### `login`

Prompts the user to log into CubeSigner. A dApp or snap can automatically log
the user in by providing the user's API session token (which they can get by
authenticating the user server-side); alternatively they can ask the user to
input their secret API session token.

> **Warning**
> The API session token is sensitive and can be used to sign with (some of)
> your keys. Do NOT share it or paste it anywhere except the CubeSigner Snap
> dialog.

#### Example (with token)

```typescript
await window.ethereum.request<boolean>({
  method: "wallet_invokeSnap",
  params: {
    snapId: defaultSnapId,
    request: {
      method: "login",
      params: { token_base64: "ewog...Q===" },
    },
  },
});
```

#### Example (without token)

```typescript
await window.ethereum.request<boolean>({
  method: "wallet_invokeSnap",
  params: { snapId: defaultSnapId, request: { method: "login" } },
});
```

### `logout`

Asks the user for confirmation, then logs out of CubeSigner. If
successful, notifies the user.

#### Example

```typescript
await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: { snapId: defaultSnapId, request: { method: "logout" } },
});
```

### `get_keys`

Returns all keys accessible from the current session.

#### Returns

An array of objects, each of which containing:

- `id: string` - the unique key identifier
- `enabled: boolean` - whether the key is enabled
- `type: KeyType` - key type (e.g., "SecpEthAddr", "SecpBtc", "BlsPub", etc.)
- `materialId: string` - a unique identifier specific to the type of key, such as a public key or an Ethereum address
- `publicKey: string` - hex-encoded, serialized public key (the format used depends on the key type)
- `owner: string` - the unique identifier of user who owns the key

#### Example

```typescript
const keys = (await window.ethereum.request<Key[]>({
  method: "wallet_invokeSnap",
  params: { snapId: defaultSnapId, request: { method: "get_keys" } },
})) as Key[];

keys.forEach((key) => console.log(key.id));
```

### `sign_blob`

Asks the user for confirmation, then proceeds to sign a raw blob.

#### Parameters

- `keyId: string` - the identifier of the key to use for signing (corresponds to the `KeyInfo.key_id` property)
- `body: BlobSignRequest` - the request object containing:
  - `message_base64: string` - the blob to sign, encoded as a base64 string

#### Returns

An object containing the signature:

- `signature: string` - the signature, encoded as a hex string

#### Example

```typescript
const sig = (await window.ethereum.request<BlobSignResponse>({
  method: "wallet_invokeSnap",
  params: {
    snapId: defaultSnapId,
    request: {
      method: "sign_blob",
      params: {
        keyId: "Key#...",
        body: { message_base64: "L1kE9g59xD3fzYQQSR7340BwU9fGrP6EMfIFcyX/YBc=" },
      },
    },
  },
})) as BlobSignResponse;

console.log(sig.signature);
```

### `sign_evm`

Asks the user for confirmation, then proceeds to sign an EVM transaction.

#### Parameters

- `pubkey: string` - the material ID of the key to use for signing (corresponds to the `KeyInfo.material_id` property)
- `body: Eth1SignRequest` - the request object containing:
  - `chain_id: number` - the ID of the chain
  - `tx` - [unsigned transaction](https://docs.ethers.org/v5/api/utils/transactions/#UnsignedTransaction)

#### Returns

An object containing the signature:

- `rlp_signed_tx: string` - hex-encoded RLP encoding of the transaction and its signature

#### Example

```typescript
const sig = (await window.ethereum.request<Eth1SignResponse>({
  method: "wallet_invokeSnap",
  params: {
    snapId: defaultSnapId,
    request: {
      method: "sign_evm",
      params: {
        pubkey: "0x...",
        body: {
          chain_id: 1,
          tx: { ... }
        }
      }
    }
  },
})) as Eth1SignResponse;

console.log(sig.rlp_signed_tx);
```

### `sign_solana`

Asks the user for confirmation, then proceeds to sign a Solana transaction.

#### Parameters

- `pubkey: string` - the material ID of the key to use for signing (corresponds to the `KeyInfo.material_id` property)
- `body: SolanaSignRequest` - the request object containing
  - `message` - [Solana message](https://docs.rs/solana-program/latest/solana_program/message/legacy/struct.Message.html) to sign

#### Returns

A `SolanaSignResponse` object containing the signature:

- `signature: string` - hex-encoded signature

#### Example

```typescript
const sig = (await window.ethereum.request<SolanaSignResponse>({
  method: "wallet_invokeSnap",
  params: {
    snapId: defaultSnapId,
    request: {
      method: "sign_solana",
      params: {
        pubkey: "Solana_...",
        body: {
          message: { ... }
        }
      }
    }
  },
})) as SolanaSignResponse;

console.log(sig.signature);
```

### `sign_btc`

Asks the user for confirmation, then proceeds to sign a Bitcoin transaction.

- `pubkey: string` - the material ID of the key to use for signing (corresponds to the `KeyInfo.material_id` property)
- `body: BtcSignRequest` - the request object

#### Returns

A `BtcSignResponse` object containing the signature:

- `signature: string` - the hex-encoded signature in DER format

#### Example

```typescript
const sig = (await window.ethereum.request<BtcSignResponse>({
  method: "wallet_invokeSnap",
  params: {
    snapId: defaultSnapId,
    request: {
      method: "sign_btc",
      params: {
        pubkey: "bc1...",
        body: {
          sig_kind: {
            Segwit: {
              input_index: 0,
              script_code: "0x76a91479091972186c449eb1ded22b78e40d009bdf008988ac",
              value: 1_000_000,
              sighash_type: "All",
            },
            tx: {
              version: 1,
              lock_time: 1170,
              input: [
                {
                  previous_output:
                    "77541aeb3c4dac9260b68f74f44c973081a9d4cb2ebe8038b2d70faa201b6bdb:1",
                  script_sig: "",
                  sequence: 4294967294,
                  witness: [],
                },
              ],
              output: [
                {
                  value: 199996600,
                  script_pubkey: "76a914a457b684d7f0d539a46a45bbc043f35b59d0d96388ac",
                },
                {
                  value: 800000000,
                  script_pubkey: "76a914fd270b1ee6abcaea97fea7ad0402e8bd8ad6d77c88ac",
                },
              ],
            },
          },
        },
      },
    },
  },
})) as BtcSignResponse;

console.log(sig.signature);
```
