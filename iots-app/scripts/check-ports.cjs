const net = require('node:net');

async function checkPorts(ports) {
  for (const port of ports) {
    for (const host of ['127.0.0.1', '::1']) {
      await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', error => {
          if (host === '::1' && ['EAFNOSUPPORT', 'EADDRNOTAVAIL'].includes(error.code)) return resolve();
          reject(new Error(`Port ${port} (${host}) is unavailable: ${error.code}. Stop the existing IOTS dev command first. No services were started.`));
        });
        server.listen(port, host, () => server.close(resolve));
      });
    }
  }
}
module.exports = { checkPorts };
