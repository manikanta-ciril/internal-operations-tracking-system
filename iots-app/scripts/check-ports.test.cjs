const assert = require('node:assert/strict');
const net = require('node:net');
const { checkPorts } = require('./check-ports.cjs');

async function main() {
  for (const host of ['127.0.0.1', '::1']) {
    const server = net.createServer();
    try {
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, host, resolve); });
    } catch (error) {
      if (host === '::1' && ['EAFNOSUPPORT', 'EADDRNOTAVAIL'].includes(error.code)) continue;
      throw error;
    }
    const port = server.address().port;
    try { await assert.rejects(checkPorts([port]), /unavailable/); }
    finally { await new Promise(resolve => server.close(resolve)); }
    await checkPorts([port]);
  }
  console.log('PASS: IPv4 and IPv6 conflicts rejected; free ports accepted.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
