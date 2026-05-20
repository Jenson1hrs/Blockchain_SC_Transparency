# Final Year Project — System Architecture Diagrams

**Project title:** Blockchain-Based Cosmetics & Skincare Product Authentication for SME Manufacturers and Consumers (Hyperledger Fabric)  

This markdown file contains **two Mermaid diagrams**: (1) main layered architecture and (2) QR verification workflow. Preview with:

- **VS Code / Cursor**: “Markdown Preview Mermaid Support” or the Mermaid extension  
- **GitHub**: renders Mermaid natively on `.md` preview  
- **Exported PDF**: paste into Typora / Obsidian / Mermaid Live Editor  

---

## 1. Main System Architecture Diagram

Shows **user roles** (primary: manufacturer/brand and consumer; supporting: distributor, retailer, regulator, admin), **frontend**, **backend**, split **on-chain (Fabric)** vs **off-chain (PostgreSQL)**, and **high-level QR verification** for cosmetics/skincare products.

```mermaid
flowchart TB
  subgraph USERS["① User Roles"]
    direction LR
    UC["Consumer"]
    UM["Manufacturer"]
    UD["Distributor"]
    UR["Retailer"]
    UA["Admin"]
  end

  subgraph FE["② Frontend Layer — React + Vite"]
    direction LR
    F1["Landing Page"]
    F2["Login / Register"]
    F3["Dashboard"]
    F4["Product Creation"]
    F5["QR Verification"]
    F6["Inventory"]
    F7["Expiring Soon"]
    F8["Transfer Ownership"]
    F9["Update Location"]
    FA["Profile & Settings"]
  end

  subgraph API["③ Backend Layer — Node.js + Express API"]
    direction TB
    B1["JWT Authentication"]
    B2["Role-Based Access Control"]
    B3["QR Verification Logic"]
    B4["Product Management APIs"]
    B5["Expiry Reminder Logic"]
    B6["Inventory APIs"]
    B7["Blockchain Integration Service"]
  end

  subgraph ON["④ On-chain — Hyperledger Fabric"]
    direction TB
    ON_Note["Immutable records: product lifecycle, custody, and audit trail"]
    FAB["Fabric network + chaincode"]
    ON_A["Product ID • Ownership • Transfers"]
    ON_B["Product status • Traceability history"]
    ON_C["Immutable transaction logs"]
    FAB --- ON_A
    FAB --- ON_B
    FAB --- ON_C
  end

  subgraph OFF["⑤ Off-chain — PostgreSQL"]
    direction TB
    OFF_Note["Rich metadata & fast queries for UX and reporting"]
    PG["Relational database"]
    OFF_A["User accounts • Preferences"]
    OFF_B["Expiry dates • Inventory data"]
    OFF_C["Images • Ingredients • Allergy • Halal • Usage • Expiry"]
    PG --- OFF_A
    PG --- OFF_B
    PG --- OFF_C
  end

  subgraph QR["QR verification (summary)"]
    direction LR
    Q1["Create product"] --> Q2["Metadata in DB + record on Fabric"]
    Q2 --> Q3["QR points to verify URL / product id"]
    Q3 --> Q4["Consumer scans → API verifies → UI shows details + history"]
  end

  USERS --> FE
  FE --> API
  API --> OFF
  B7 <--> FAB
  B3 --> FAB
  B3 --> PG
  B4 --> B7
  B4 --> PG
  B6 --> PG
  B5 --> PG
```

**On-chain vs off-chain (short):**

| Domain | What it is for in this project |
|--------|--------------------------------|
| **On-chain (Fabric)** | Tamper-evident **identity of the product on the ledger**, **ownership / transfers**, **status changes**, and **append-only history** that supports anti-counterfeiting claims. |
| **Off-chain (PostgreSQL)** | **User accounts**, **UI-friendly product details** (images, ingredients, instructions), **expiry**, **inventory lists**, and **preferences** — updated quickly without putting large blobs on-chain. |

---

## 2. QR Verification Workflow Diagram

End-to-end flow from **product creation** through **QR generation**, **scanning**, and **authenticity outcome**.

```mermaid
sequenceDiagram
  autonumber
  participant M as Manufacturer
  participant FE as Frontend (React + Vite)
  participant BE as Backend (Node.js + Express)
  participant FAB as Hyperledger Fabric (on-chain)
  participant DB as PostgreSQL (off-chain)
  participant C as Consumer (mobile browser)

  Note over FAB: On-chain: IDs, ownership, transfers, status, trace, immutable logs
  Note over DB: Off-chain: images, ingredients, allergy, instructions, expiry, inventory, users

  M->>FE: Submit product creation
  FE->>BE: Product create API
  BE->>FAB: Write product / lifecycle record (chaincode)
  FAB-->>BE: Confirmed transaction
  BE->>DB: Sync off-chain metadata
  DB-->>BE: OK
  BE-->>FE: Success + verification URL / QR payload
  FE-->>M: Display / download QR

  C->>FE: Open scan / verify link
  FE->>BE: Verify request (ID + integrity check e.g. hash)
  BE->>BE: Validate signature / hash
  alt Invalid or tampered
    BE-->>FE: Not authentic / invalid
    FE-->>C: Show fake / warning UI
  else Valid
    BE->>FAB: Query on-chain traceability
    FAB-->>BE: Ownership, transfers, status, history
    BE->>DB: Query off-chain product details
    DB-->>BE: Images, ingredients, expiry, etc.
    BE-->>FE: Authentic + combined view
    FE-->>C: Show authentic + history + details
  end
```

---

## Legend (for slides / report)

- **Blue path (users → UI → API)**: normal application traffic.  
- **Green API box**: business rules, auth, and integration.  
- **Purple (Fabric)**: **on-chain** trust anchor.  
- **Orange (PostgreSQL)**: **off-chain** operational data.  

---

*Last updated: FYP documentation — system architecture overview.*
