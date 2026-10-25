/**
 * LIMO 5-Stage Pipeline Register Data Models
 */

// IF/ID Pipeline Register (Carries fetched instruction down to decode)
const IF_ID_Register = {
    pc: 0x0000,
    instruction: 0x00000000,
    valid: false
};

// ID_EX Pipeline Register (Carries decoded operands and control signals to execute)
const ID_EX_Register = {
    pc: 0x0000,
    rs1Value: 0,
    rs2Value: 0,
    immediate: 0,
    rd: 0,
    rs1: 0,
    rs2: 0,
    // Control Signals
    aluOp: 0,
    aluSrc: 0,     // 0 = Reg, 1 = Immediate
    memWrite: false,
    memRead: false,
    regWrite: false,
    branch: false
};

// EX_MEM Pipeline Register (Carries ALU results and memory parameters)
const EX_MEM_Register = {
    aluResult: 0,
    writeData: 0,  // Value to store in memory (for boloka)
    rd: 0,
    // Control Signals
    memWrite: false,
    memRead: false,
    regWrite: false
};

// MEM_WB Pipeline Register (Carries final data back to register file)
const MEM_WB_Register = {
    memData: 0,
    aluResult: 0,
    rd: 0,
    // Control Signals
    regWrite: false,
    toReg: 0       // 0 = ALU result, 1 = Memory data
};
