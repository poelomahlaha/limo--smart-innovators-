# LIMO ISA Specification (AY 2026/2027)

## 1. Architecture Overview (A1)
* **Word Size**: 32-bit fixed-length instructions.
* **Addressing**: Byte-addressed, Little-Endian memory layout, 32-bit word-aligned.
* **Execution Model**: Load-store architecture (only explicit load/store operations touch memory)[cite: 2].
* **Formats**: Derived directly from RV32I (R, I, S, B)[cite: 2].

---

## 2. Register File Specification (A2)
LIMO features 16 general-purpose 32-bit registers (`r0`–`r15`), reducing register address field widths from 5 bits to 4 bits[cite: 2].

| Register | Sesotho Name | RV32I Equivalent | Description |
| :--- | :--- | :--- | :--- |
| `r0` | `lefeela` | `x0` / `zero` | Hard-wired zero (always reads 0)[cite: 2] |
| `r1` | `khutlisa` | `x1` / `ra` | Return address[cite: 2] |
| `r2` | `sesupo` | `x2` / `sp` | Stack pointer[cite: 2] |
| `r3` | `mofani` | `x10` / `a0` | Function argument / Return value |
| `r4` | `mofani_p` | `x11` / `a1` | Function argument 2 |
| `r5`–`r10` | `polokelo0`–`5` | `x5`–`x10` | Temporary / caller-saved registers |
| `r11`–`r14` | `mosebetsi0`–`3` | `x18`–`x21` | Saved / callee-saved registers |
| `r15` | `polokelo_kakaretso` | `x31` | General scratchpad register |
| **PC** | `sebali` | `PC` | Program Counter[cite: 2] |

---

## 3. Instruction Formats (A5)

```text
R-Type: [ funct7 (7b) | rs2 (4b) | rs1 (4b) | funct3 (3b) | rd (4b) | opcode (10b) ]
I-Type: [ imm[11:0] (12b)        | rs1 (4b) | funct3 (3b) | rd (4b) | opcode (10b) ]
S-Type: [ imm[11:4] (8b)  | rs2 (4b) | rs1 (4b) | funct3 (3b) | imm[3:0] (4b) | opcode (10b) ]
B-Type: [ imm[12|10:5] (7b)| rs2 (4b) | rs1 (4b) | funct3 (3b) | imm[4:1|11] (4b) | opcode (10b) ]```


## 4. Glossary & Instruction Set (A3, A4)

## 4. Glossary & Instruction Set (A3, A4)

* **Orthography Note**: Apostrophes in Sesotho orthography (e.g., `ts`, `ch`) are ignored by the assembler lexer and `sutha_ts` are treated as identical tokens.

| Mnemonic | Sesotho Meaning | Type | Opcode | Funct3 | Operation | RV32I Equivalent |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `eketsa` | Add | R | `0110011` | `000` | R[rd] <- R[rs1] + R[rs2] | `add` |
| `fokotsa` | Subtract | R | `0110011` | `000` | R[rd] <- R[rs1] - R[rs2] | `sub` |
| `eketsa_e` | Add Immediate | I | `0010011` | `000` | R[rd] <- R[rs1] + sign_ext(imm) | `addi` |
| `mmoho` | AND | R | `0110011` | `111` | R[rd] <- R[rs1] & R[rs2] | `and` |
| `kapa` | OR | R | `0110011` | `110` | R[rd] <- R[rs1] | R[rs2] | `or` |
| `sutha_ts` | Shift Right Logical | I | `0010011` | `101` | R[rd] <- R[rs1] >> imm[4:0] | `srli` |
| `jarolla` | Load Word | I | `0000011` | `010` | R[rd] <- M[R[rs1] + imm] | `lw` |
| `boloka` | Store Word | S | `0100011` | `010` | M[R[rs1] + imm] <- R[rs2] | `sw` |
| `lekana` | Branch Equal | B | `1100011` | `000` | if R[rs1] == R[rs2], PC <- PC + imm | `beq` |
| `fapana` | Branch Not Equal | B | `1100011` | `001` | if R[rs1] != R[rs2], PC <- PC + imm | `bne` |





Fields: 0000000 | 0010 (r2) | 0001 (r1) | 000 | 0011 (r3) | 0110011

Binary: 000000000100001000000110110011

Hexadecimal: 0x002081B3

Example 2: eketsa_e r5, r0, 10 (I-Type)
Format: imm[11:0] | rs1 | funct3 | rd | opcode

Fields: 000000001010 (10) | 0000 (r0) | 000 | 0101 (r5) | 0010011

Binary: 0000000010100000000001010010011

Hexadecimal: 0x00A00293

Example 3: jarolla r6, 4(r2) (I-Type)
Format: imm[11:0] | rs1 | funct3 | rd | opcode

Fields: 000000000100 (4) | 0010 (r2) | 010 | 0110 (r6) | 0000011

Binary: 000000000100001001001100000011

Hexadecimal: 0x00412303


---

## 5. Hand-Encoded Instruction Examples (A5)

### Example 1: `eketsa r3, r1, r2` (R-Type)
* **Format**: `funct7 | rs2 | rs1 | funct3 | rd | opcode`
* **Fields**: `0000000 | 0010 (r2) | 0001 (r1) | 000 | 0011 (r3) | 0110011`
* **Binary**: `000000000100001000000110110011`
* **Hexadecimal**: `0x002081B3`

### Example 2: `eketsa_e r5, r0, 10` (I-Type)
* **Format**: `imm[11:0] | rs1 | funct3 | rd | opcode`
* **Fields**: `000000001010 (10) | 0000 (r0) | 000 | 0101 (r5) | 0010011`
* **Binary**: `0000000010100000000001010010011`
* **Hexadecimal**: `0x00A00293`

### Example 3: `jarolla r6, 4(r2)` (I-Type)
* **Format**: `imm[11:0] | rs1 | funct3 | rd | opcode`
* **Fields**: `000000000100 (4) | 0010 (r2) | 010 | 0110 (r6) | 0000011`
* **Binary**: `000000000100001001001100000011`
* **Hexadecimal**: `0x00412303`
