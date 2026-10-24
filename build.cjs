const fs = require('node:fs/promises'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const { tool } = require('./tools.cjs');

async function headers(directory) {
    await fs.mkdir(directory, { recursive: true });
    for (const name of ['abi.glsl', 'hb.glsl', 'draw.glsl'])
        await fs.copyFile(path.join(__dirname, 'include', name), path.join(directory, name));
}

function compile(source, output) {
    execFileSync(tool('GLSLANG', 'glslangValidator'), ['-V', '-Os', '-g0', '--target-env', 'vulkan1.0', source, '-o', output], { stdio: 'inherit' });
    execFileSync(tool('SPIRV_VAL', 'spirv-val'), ['--target-env', 'vulkan1.0', output], { stdio: 'inherit' });
}

async function main() {
    const state = Buffer.alloc(1024); state.writeFloatLE(1, 960);
    await fs.writeFile(path.join(__dirname, 'assets/state.bin'), state);
    execFileSync('python3', [path.join(__dirname, 'assets.py')], { stdio: 'inherit' });
    await headers(path.join(__dirname, 'shaders'));
    for (const stage of ['vert', 'frag', 'comp'])
        compile(path.join(__dirname, 'shaders/app.' + stage), path.join(__dirname, 'app.' + stage + '.spv'));
    console.log('Built app.vert.spv, app.frag.spv and app.comp.spv.');
}

main().catch(e => { console.error(e); process.exitCode = 1; });
