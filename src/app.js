document.addEventListener('DOMContentLoaded', () => {
    const assembler = new LimoAssembler();
    let assembledInstructions = [];
    let pc = 0;
    let cycles = 0;
    let instructionsRetired = 0;
    let runInterval = null; // Stores the timer ID for continuous execution

    let pipeline = {
        if: "--",
        id: "--",
        ex: "--",
        mem: "--",
        wb: "--"
    };

    // Core step logic shared by both manual stepping and continuous run
    function stepPipeline() {
        cycles++;

        pipeline.wb = pipeline.mem;
        pipeline.mem = pipeline.ex;
        pipeline.ex = pipeline.id;
        pipeline.id = pipeline.if;

        const instructionIndex = Math.floor(pc / 4);
        if (assembledInstructions.length > 0 && instructionIndex < assembledInstructions.length) {
            pipeline.if = assembledInstructions[instructionIndex].source;
            pc += 4;
            instructionsRetired++;
        } else {
            pipeline.if = "--";
        }

        // Update UI displays
        document.getElementById('pipe-if').innerText = pipeline.if;
        document.getElementById('pipe-id').innerText = pipeline.id;
        document.getElementById('pipe-ex').innerText = pipeline.ex;
        document.getElementById('pipe-mem').innerText = pipeline.mem;
        document.getElementById('pipe-wb').innerText = pipeline.wb;

        document.getElementById('val-cycles').innerText = cycles;
        document.getElementById('val-inst').innerText = instructionsRetired;
        
        const cpi = instructionsRetired > 0 ? (cycles / instructionsRetired).toFixed(2) : "0.00";
        document.getElementById('val-cpi').innerText = cpi;

        // Auto-pause if we run out of instructions and pipeline is empty
        if (instructionIndex >= assembledInstructions.length && pipeline.if === "--" && pipeline.id === "--" && pipeline.ex === "--" && pipeline.mem === "--" && pipeline.wb === "--") {
            pauseExecution();
        }
    }

    function pauseExecution() {
        if (runInterval) {
            clearInterval(runInterval);
            runInterval = null;
        }
    }

    // 1. Handle "Assemble Code" Button
    const assembleBtn = document.getElementById('btn-assemble');
    if (assembleBtn) {
        assembleBtn.addEventListener('click', () => {
            const code = document.getElementById('assemblyCode').value;
            const outputBox = document.getElementById('outputResult');
            
            try {
                const result = assembler.assemble(code);
                outputBox.textContent = JSON.stringify(result, null, 2);

                if (result.success) {
                    assembledInstructions = result.machineCode;
                    pc = 0;
                }
            } catch (err) {
                outputBox.textContent = "Error: " + err.message;
            }
        });
    }

    // 2. Handle "Run" Button (Continuous Execution)
    const runBtn = document.getElementById('btn-run');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            if (!runInterval && assembledInstructions.length > 0) {
                // Run every 600ms (adjust speed here if needed)
                runInterval = setInterval(stepPipeline, 600);
            }
        });
    }

    // 3. Handle "Pause" Button
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            pauseExecution();
        });
    }

    // 4. Handle "Step (1 Cycle)" Button
    const stepBtn = document.getElementById('btn-step');
    if (stepBtn) {
        stepBtn.addEventListener('click', () => {
            pauseExecution(); // Pause automatic run if manual step is clicked
            stepPipeline();
        });
    }

    // 5. Handle "Reset" Button
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            pauseExecution();
            pc = 0;
            cycles = 0;
            instructionsRetired = 0;
            pipeline = { if: "--", id: "--", ex: "--", mem: "--", wb: "--" };
            
            document.getElementById('pipe-if').innerText = "--";
            document.getElementById('pipe-id').innerText = "--";
            document.getElementById('pipe-ex').innerText = "--";
            document.getElementById('pipe-mem').innerText = "--";
            document.getElementById('pipe-wb').innerText = "--";
            document.getElementById('val-cycles').innerText = "0";
            document.getElementById('val-inst').innerText = "0";
            document.getElementById('val-cpi').innerText = "0.00";
        });
    }
});
