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
B-Type: [ imm[12|10:5] (7b)| rs2 (4b) | rs1 (4b) | funct3 (3b) | imm[4:1|11] (4b) | opcode (10b) ]
