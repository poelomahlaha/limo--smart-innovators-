---

### File 2: `docs/DESIGN_DECISIONS.md`

Open `docs/DESIGN_DECISIONS.md` and paste the following content[cite: 2, 3]:

```markdown
# LIMO Design-Decision Log (A6)

### (a) Register-File Size Impact
Choosing a 16-register file (`r0`–`r15`) requires 4-bit register addresses instead of 5[cite: 2]. This saves 3 bits per instruction involving register operands[cite: 2]. The 4-bit width shrinks forwarding-comparator logic from 5-bit to 4-bit equal-match circuits, reducing overall gate count and critical path delay in the Execution (EX) stage[cite: 2]. However, halved register availability increases register pressure; complex loop structures must spill variables to memory via `boloka` (store) and `jarolla` (load) instructions more frequently, slightly lowering instruction execution density[cite: 2].

### (b) Architectural vs. Microarchitectural Registers
Architectural registers (PC, `r0`–`r15`) are explicit software-visible states preserved across execution[cite: 2]. Microarchitectural registers (e.g., `IF/ID`, `ID/EX`, `EX/MEM`, `MEM/WB`) are hardware pipeline registers used solely to hold intermediate transient data and control signals across clock cycles[cite: 2]. The ISA must not specify microarchitectural registers because doing so would lock hardware vendors into a specific pipeline depth (e.g., 5-stage)[cite: 2]. Omitting hardware register specifications allows the processor hardware design to be changed—such as moving to single-cycle, out-of-order, or 7-stage designs—without breaking binary compatibility[cite: 2].

### (c) Branch Resolution Stage
LIMO resolves branches in the Instruction Decode (ID) stage rather than the Execution (EX) stage[cite: 2]. Resolving branches in ID requires an extra adder and equality comparator in ID[cite: 2], but reduces branch latency penalty from 2 clock cycles down to 1[cite: 2]. When a branch is taken, only 1 instruction (`IF/ID`) must be flushed instead of 2 (`IF/ID` and `ID/EX`)[cite: 2]. This hardware tradeoff pays off significantly in tight loops where frequent branch mispredictions would otherwise cost 2 stalled/flushed cycles every iteration[cite: 2].

### (d) Load-Use Hazard Stalling
A load instruction (`jarolla`) updates its target register at the end of the Write-Back (WB) stage[cite: 2]. If a directly following instruction requires that loaded value in its EX stage, full forwarding cannot resolve the timing conflict because the memory data is only available at the output of the MEM stage (end of cycle $N$)[cite: 2]. The dependent ALU operation needs the operand at the start of cycle $N$[cite: 2]. Therefore, execution MUST stall for 1 cycle (inserting a pipeline bubble into `ID/EX`), delaying the dependent instruction so forwarding from `MEM/WB` can supply the data[cite: 2].

### (e) Flags Register Evaluation
LIMO intentionally avoids a status flags register (e.g., zero, carry, overflow flags)[cite: 2]. Flags registers create implicit state dependencies across instructions, complicating pipeline scheduling, hazard detection, and instruction reordering[cite: 2]. In a flagged architecture, every arithmetic instruction modifies flags, creating false Write-After-Read (WAR) and Write-After-Write (WAW) hazards[cite: 2]. Following RISC-V's design, LIMO performs direct conditional comparison and branching (`lekana`, `fapana`) within single instructions, keeping pipeline hazards clean and explicit[cite: 2].

### (f) Program Scalability Limits
As programs expand, **branch reach** breaks first[cite: 2]. Branch instructions (`B-type`) restrict immediate offset reach to a signed 12-bit range ($\pm 2\text{ KB}$ reach)[cite: 2]. Large program bodies or distant loop jump targets quickly exceed this threshold, requiring multi-instruction jump synthesis[cite: 2]. Register count breaks second under deep call trees, and immediate offset range ($12$-bit signed offset for loads/stores) breaks last, as typical memory frame offsets remain compact[cite: 2].
