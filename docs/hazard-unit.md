# LIMO Hazard Detection & Forwarding Documentation

## 1. Overview
The LIMO 5-stage pipeline implements hardware interlocks and bypassing to manage data dependencies and control hazards efficiently.

## 2. Forwarding Logic (RAW Hazards)
To prevent unnecessary pipeline stalls when an instruction requires a register value computed immediately prior:
- **EX/MEM Bypassing (`forward = 2`)**: Routes the ALU result straight from the EX/MEM stage back into the EX stage inputs.
- **MEM/WB Bypassing (`forward = 1`)**: Routes data from the MEM/WB stage back into the EX stage inputs when the EX hazard condition is not active.

## 3. Load-Use Hazard Stall Mechanism
Because memory load instructions (`jarolla`) do not resolve data until the MEM stage, forwarding cannot bypass a load instantly. 
- **Detection**: The hazard unit monitors the EX stage for an active `memRead` signal. If the target register (`rd`) matches the source registers (`rs1` or `rs2`) in the decode stage, a hazard is flagged.
- **Stall Action**: 
  1. Freeze the Program Counter (PC).
  2. Hold the IF/ID pipeline register.
  3. Flush the ID/EX control signals (insert a NOP bubble).
