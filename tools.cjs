const fs = require('node:fs'), path = require('node:path');
function tool(environment, name) {
    const exe = process.platform === 'win32' && !name.endsWith('.exe') ? name + '.exe' : name;
    const localExe = path.resolve(__dirname, 'tools', exe);
    const local = path.resolve(__dirname, 'tools', name);
    return process.env[environment] || (fs.existsSync(localExe) ? localExe : (fs.existsSync(local) ? local : exe));
}
module.exports = { tool };
