// Should get called with a glob of extensionIds that are allowed to access the native-messaging-host
// TODO: add linux installer
async function installConfig(extensionIds) {
  console.info(`Installing config…`)

  const hostName = 'com.crx.test'
  const manifest = {
    name: hostName,
    description: 'native-messaging-host test',
    path: path.join(outDir, await import("./native-messaging-host.sea-build.js").then(x=>x.binaryName)),
    type: 'stdio',
    allowed_origins: extensionIds.map((id) => `chrome-extension://${id}/`),
  }

  const writeManifest = async (manifestPath) => {
    await fs.mkdir(manifestPath, { recursive: true });
    const filePath = path.join(manifestPath, `${hostName}.json`);
    const data = Buffer.from(JSON.stringify(manifest, null, 2));
    await fs.writeFile(filePath, data);
    return filePath;
  }
  const osSpecific = {
    win32: [
      'AppData',
      'Roaming',
    ],
    darwin: [     
      'Library',
      'Application Support',
    ]
  };
  const appData = osSpecific[process.platform];
  if (appData.length) {
    const manifestDir = path.join(
      os.homedir(),
      ...appData,
      'Electron',
      'NativeMessagingHosts',
    );
  
    const manifestPath = await writeManifest(manifestDir)
    if (process.platform.startsWith('win') {
      const registryKey = `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${hostName}`
      await exec(`reg add "${registryKey}" /ve /t REG_SZ /d "${manifestPath}" /f`, {
        stdio: 'inherit',
      })
    }
  }
}

async function main() {
  const extensionIdsArg = process.argv[2]
  if (!extensionIdsArg) {
    console.error('Must pass in csv of allowed extension IDs')
    process.exit(1)
  }

  const extensionIds = extensionIdsArg.split(',')
  await installConfig(extensionIds)
}

main()
