/**
 * LIMO Web Assembler 
 * Handles tokenization, label resolution, instruction encoding, and error reporting.
 */

class LimoAssembler {
    constructor() {
        // Define Sesotho opcode mappings and instruction formats
        this.opcodes = {
            'eketsa':   { type: 'R', opcode: 0x01 },
            'eketsa_e': { type: 'I', opcode: 0x02 },
            'boloka':   { type: 'S', opcode: 0x03 },
            'jarolla':  { type: 'L', opcode: 0x04 },
            'fapana':   { type: 'B', opcode: 0x05 }
        };
    }

    /**
     * Parses register string (e.g. 'r3') into a 4-bit integer value (0-15)
     */
    parseRegister(regStr, lineNum) {
        const cleanReg = regStr.trim().toLowerCase();
        const match = cleanReg.match(/^r([0-9]|1[0-5])$/);
        if (!match) {
            throw new Error(`Line ${lineNum}: Invalid register '${regStr}'. Must be r0 through r15.`);
        }
        return parseInt(match[1], 10);
    }

    /**
     * Parses immediate or offset value (supports decimal and hex)
     */
    parseImmediate(immStr, lineNum) {
        let val;
        const cleanImm = immStr.trim();
        if (cleanImm.startsWith('0x') || cleanImm.startsWith('0X')) {
            val = parseInt(cleanImm, 16);
        } else {
            val = parseInt(cleanImm, 10);
        }
        if (isNaN(val)) {
            throw new Error(`Line ${lineNum}: Invalid immediate value '${immStr}'.`);
        }
        return val;
    }

    /**
     * Main assemble function: Two-pass assembler for label resolution and code generation
     */
    assemble(sourceCode) {
        const lines = sourceCode.split('\n');
        const symbolTable = {};
        const instructionsToProcess = [];
        const errors = [];
        
        let currentAddress = 0;

        // --- PASS 1: Collect Labels & Strip Comments ---
        for (let i = 0; i < lines.length; i++) {
            const lineNum = i + 1;
            let rawLine = lines[i].split('#')[0].trim(); // Remove comments
            
            if (!rawLine) continue; // Skip empty lines

            // Check for label definition (e.g., "loop_start:")
            if (rawLine.includes(':')) {
                const parts = rawLine.split(':');
                const labelName = parts[0].trim();
                
                if (symbolTable[labelName] !== undefined) {
                    errors.push({ line: lineNum, message: `Duplicate label definition: '${labelName'` });
                }
                
                symbolTable[labelName] = currentAddress;
                rawLine = parts[1].trim(); // Remaining instruction on the same line
                if (!rawLine) continue;
            }

            instructionsToProcess.push({ lineNum, address: currentAddress, text: rawLine });
            currentAddress += 4; // Each LIMO instruction is 4 bytes (32-bit)
        }

        if (errors.length > 0) {
            return { success: false, errors, machineCode: [] };
        }

        // --- PASS 2: Encode Instructions ---
        const machineCode = [];

        for (const item of instructionsToProcess) {
            try {
                const { lineNum, address, text } = item;
                // Parse instruction format: mnemonic rd, rs, operand
                // Example: eketsa_e r3, r0, 5  OR  boloka r3, 0(r2)
                const tokens = text.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
                const mnemonic = tokens[0].toLowerCase();

                if (!this.opcodes[mnemonic]) {
                    throw new Error(`Line ${lineNum}: Unknown instruction mnemonic '${mnemonic}'.`);
                }

                const spec = this.opcodes[mnemonic];
                let encodedHex = '';

                if (spec.type === 'I') {
                    // Format: mnemonic rd, rs, immediate
                    const rd = this.parseRegister(tokens[1], lineNum);
                    const rs = this.parseRegister(tokens[2], lineNum);
                    const imm = this.parseImmediate(tokens[3], lineNum);

                    // Basic packing logic (example 32-bit word layout)
                    // [Opcode: 8-bit][Rd: 4-bit][Rs: 4-bit][Immediate: 16-bit]
                    const imm16 = imm & 0xFFFF;
                    const machineWord = (spec.opcode << 24) | (rd << 20) | (rs << 16) | imm16;
                    encodedHex = '0x' + machineWord.toString(16).padStart(8, '0');

                } else if (spec.type === 'R') {
                    // Format: mnemonic rd, rs1, rs2
                    const rd = this.parseRegister(tokens[1], lineNum);
                    const rs1 = this.parseRegister(tokens[2], lineNum);
                    const rs2 = this.parseRegister(tokens[3], lineNum);

                    // [Opcode: 8-bit][Rd: 4-bit][Rs1: 4-bit][Rs2: 4-bit][Unused: 12-bit]
                    const machineWord = (spec.opcode << 24) | (rd << 20) | (rs1 << 16) | (rs2 << 12);
                    encodedHex = '0x' + machineWord.toString(16).padStart(8, '0');

                } else if (spec.type === 'S' || spec.type === 'L') {
                    // Format: mnemonic rt, offset(base) -> e.g., boloka r3, 0(r2)
                    const rt = this.parseRegister(tokens[1], lineNum);
                    const memTarget = tokens[2]; // e.g. "0(r2)"
                    
                    const memMatch = memTarget.match(/^(-?\d+)\((r[0-9]|1[0-5])\)$/);
                    if (!memMatch) {
                        throw new Error(`Line ${lineNum}: Invalid memory syntax '${memTarget}'. Expected offset(base).`);
                    }
                    const offset = parseInt(memMatch[1], 10);
                    const base = this.parseRegister(memMatch[2], lineNum);

                    const machineWord = (spec.opcode << 24) | (rt << 20) | (base << 16) | (offset & 0xFFFF);
                    encodedHex = '0x' + machineWord.toString(16).padStart(8, '0');

                } else if (spec.type === 'B') {
                    // Format: mnemonic rs1, rs2, label_or_offset
                    const rs1 = this.parseRegister(tokens[1], lineNum);
                    const rs2 = this.parseRegister(tokens[2], lineNum);
                    
                    let targetVal;
                    const targetStr = tokens[3];
                    if (symbolTable[targetStr] !== undefined) {
                        // Relative branch offset calculation
                        targetVal = (symbolTable[targetStr] - (address + 4)) / 4;
                    } else {
                        targetVal = this.parseImmediate(targetStr, lineNum);
                    }

                    const machineWord = (spec.opcode << 24) | (rs1 << 20) | (rs2 << 16) | (targetVal & 0xFFFF);
                    encodedHex = '0x' + machineWord.toString(16).padStart(8, '0');
                }

                machineCode.push({
                    address: '0x' + address.toString(16).padStart(4, '0'),
                    hex: encodedHex,
                    source: text
                });

            } catch (err) {
                errors.push({ line: item.lineNum, message: err.message });
            }
        }

        if (errors.length > 0) {
            return { success: false, errors, machineCode: [] };
        }

        return { success: true, errors: [], machineCode };
    }
}

// Export for browser usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LimoAssembler;
} else {
    window.LimoAssembler = LimoAssembler;
}
