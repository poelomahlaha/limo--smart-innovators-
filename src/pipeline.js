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

/**
 * LIMO 5-Stage Pipeline, Hazard Unit, & Forwarding Logic
 * File path: src/pipeline.js
 */

class LimoPipeline {
    constructor() {
        this.reset();
    }

    reset() {
        // Pipeline Registers
        this.IF_ID = { pc: 0, instruction: 0, valid: false };
        this.ID_EX = { pc: 0, rs1Value: 0, rs2Value: 0, immediate: 0, rd: 0, rs1: 0, rs2: 0, aluOp: 0, aluSrc: 0, memWrite: false, memRead: false, regWrite: false, branch: false };
        this.EX_MEM = { aluResult: 0, writeData: 0, rd: 0, memWrite: false, memRead: false, regWrite: false };
        this.MEM_WB = { memData: 0, aluResult: 0, rd: 0, regWrite: false, toReg: 0 };
    }

    /**
     * FORWARDING UNIT (Resolves RAW Data Hazards)
     */
    resolveForwarding(id_ex_rs1, id_ex_rs2, ex_mem_rd, mem_wb_rd, ex_mem_regWrite, mem_wb_regWrite) {
        let forwardA = 0; // 00 = Normal, 10 = EX/MEM, 01 = MEM/WB
        let forwardB = 0;

        // EX Hazard
        if (ex_mem_regWrite && (ex_mem_rd !== 0) && (ex_mem_rd === id_ex_rs1)) forwardA = 2;
        if (ex_mem_regWrite && (ex_mem_rd !== 0) && (ex_mem_rd === id_ex_rs2)) forwardB = 2;

        // MEM Hazard
        if (mem_wb_regWrite && (mem_wb_rd !== 0) && 
            !(ex_mem_regWrite && (ex_mem_rd !== 0) && (ex_mem_rd === id_ex_rs1)) && 
            (mem_wb_rd === id_ex_rs1)) forwardA = 1;

        if (mem_wb_regWrite && (mem_wb_rd !== 0) && 
            !(ex_mem_regWrite && (ex_mem_rd !== 0) && (ex_mem_rd === id_ex_rs2)) && 
            (mem_wb_rd === id_ex_rs2)) forwardB = 1;

        return { forwardA, forwardB };
    }

    /**
     * HAZARD DETECTION UNIT (Detects Load-Use Hazards & Triggers Stalls)
     */
    detectLoadUseHazard(id_ex_memRead, id_ex_rd, if_id_rs1, if_id_rs2) {
        if (id_ex_memRead && (id_ex_rd !== 0)) {
            if (id_ex_rd === if_id_rs1 || id_ex_rd === if_id_rs2) {
                return true; // Stall required
            }
        }
        return false;
    }
}

window.LimoPipeline = LimoPipeline;

// MEM_WB Pipeline Register (Carries final data back to register file)
const MEM_WB_Register = {
    memData: 0,
    aluResult: 0,
    rd: 0,
    // Control Signals
    regWrite: false,
    toReg: 0       // 0 = ALU result, 1 = Memory data
};
