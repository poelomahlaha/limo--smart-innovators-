/**
 * Resolves control hazards, branch evaluation, and pipeline flushing
 */
class ControlHazardUnit {
    /**
     * Evaluates branch condition and target address
     */
    evaluateBranch(opcode, rs1Val, rs2Val, immediate, currentPC) {
        let isTaken = false;
        let targetPC = currentPC + 4;

        if (opcode === 0x05) { // 'fapana' (Branch if equal example)
            if (rs1Val === rs2Val) {
                isTaken = true;
                targetPC = currentPC + (immediate * 4); // Relative branch offset
            }
        }

        return { isTaken, targetPC };
    }

    /**
     * Generates a flush signal to clear incorrect instructions from IF/ID and ID/EX
     */
    flushPipelineOnBranch() {
        return {
            flushIF_ID: true,
            flushID_EX: true
        };
    }
}
