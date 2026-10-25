/**
 * Automated Unit Tests for LIMO Assembler
 * Run using Node.js: node test-assembler.js
 */

const assert = require('assert');
// Import your assembler class (export it for node or read it via fs if needed)
const LimoAssembler = require('./src/assembler.js');

// Helper to make assembler work in Node if window is not defined
if (typeof window === 'undefined') {
    global.window = {};
}

const assembler = new LimoAssembler();

console.log("Running LIMO Assembler Unit Tests...\n");

// --- TEST 1: Assemble valid I-Type instruction ---
try {
    const source = "eketsa_e r3, r0, 5";
    const result = assembler.assemble(source);
    
    assert.strictEqual(result.success, true, "I-Type assembly should succeed");
    assert.strictEqual(result.machineCode.length, 1, "Should output 1 machine code instruction");
    assert.strictEqual(result.machineCode[0].address, "0x0000", "Starting address should be 0x0000");
    console.log("✓ PASSED: Valid I-Type instruction encoding");
} catch (err) {
    console.error("✗ FAILED: I-Type instruction test", err.message);
}

// --- TEST 2: Assemble Memory instruction (S-Type) ---
try {
    const source = "boloka r3, 0(r2)";
    const result = assembler.assemble(source);
    
    assert.strictEqual(result.success, true, "Memory instruction assembly should succeed");
    console.log("✓ PASSED: Valid S-Type memory syntax encoding");
} catch (err) {
    console.error("✗ FAILED: Memory instruction test", err.message);
}

// --- TEST 3: Label Resolution & Branching (B-Type) ---
try {
    const source = `
        loop_start:
        fapana r1, r2, loop_start
    `;
    const result = assembler.assemble(source);
    
    assert.strictEqual(result.success, true, "Label resolution should succeed");
    assert.strictEqual(result.machineCode.length, 1, "Comments and labels should be stripped/resolved into 1 instruction");
    console.log("✓ PASSED: Label resolution and branching offset");
} catch (err) {
    console.error("✗ FAILED: Label resolution test", err.message);
}

// --- TEST 4: Error Handling (Invalid Register) ---
try {
    const source = "eketsa_e r20, r0, 5"; // r20 is invalid (must be r0-r15)
    const result = assembler.assemble(source);
    
    assert.strictEqual(result.success, false, "Should fail on invalid register");
    assert.ok(result.errors.length > 0, "Should return an error message");
    console.log("✓ PASSED: Error handling for out-of-bound registers");
} catch (err) {
    console.error("✗ FAILED: Error handling test", err.message);
}

console.log("\nAll assembler unit tests completed!");
