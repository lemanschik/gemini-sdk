//https://nodejs.org/api/single-executable-applications.html
import fs from 'node:fs'
import cp from 'node:child_process'
const seaConfigFilename = 'native-messaging-host.sea-config.json';
const injectionBlob = "native-messaging-host.blob";
fs.writeFileSync(seaConfigFilename,JSON.stringify(
{
  "main": "native-messaging-host.js",
  "disableExperimentalSEAWarning": true,
  "output": injetionBlob
}
));

// Injection Blob
cp.execSync(`${process.execPath} --experimental-sea-config ${seaConfigFilename}`);


// native-messaging-host.node or native-messaging-host.node.exe
const binaryName = `native-messaging-host.${process.execPath.replaceAll('\\','/').split('/').at(-1)}`;
fs.copyFileSync(process.execPath, binaryName);
// https://www.electronjs.org/docs/latest/tutorial/fuses
const fuse = `NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`;
const basicCommand = `npx postject ${binaryName} NODE_SEA_BLOB ${injetionBlob} --sentinel-fuse ${fuse} ${
  process.platform.startsWith('dar') ? '--macho-segment-name NODE_SEA' : ''
}`;

const sign = `Sign the binary (macOS and Windows only):
On macOS: codesign --sign - ${binaryName}
On Windows (optional): A certificate needs to be present for this to work. However, the unsigned binary would still be runnable.
signtool sign /fd SHA256 ${binaryName}`;

/**
Run the binary: On systems other than Windows
$ ./hello world
Hello, world! copy

On Windows
$ .\hello.exe world
Hello, world! 
*/

