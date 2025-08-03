async function installConfig(extensionIds) {
  console.info(`Installing config…`)

  const hostName = 'com.crx.test'
  const manifest = {
    name: hostName,
    description: 'electron-chrome-extensions test',
    path: path.join(outDir, await import("./native-messaging-host.sea-build.js").then(x=>x.binaryName)),
    type: 'stdio',
    allowed_origins: extensionIds.map((id) => `chrome-extension://${id}/`),
  }

  const writeManifest = async (manifestPath) => {
    await fs.mkdir(manifestPath, { recursive: true })
    const filePath = path.join(manifestPath, `${hostName}.json`)
    const data = Buffer.from(JSON.stringify(manifest, null, 2))
    await fs.writeFile(filePath, data)
    return filePath
  }

  switch (process.platform) {
    case 'darwin': {
      const manifestDir = path.join(
        os.homedir(),
        'Library',
        'Application Support',
        'Electron',
        'NativeMessagingHosts',
      )
      await writeManifest(manifestDir)
      break
    }
    case 'win32': {
      const manifestDir = path.join(
        os.homedir(),
        'AppData',
        'Roaming',
        'Electron',
        'NativeMessagingHosts',
      )
      const manifestPath = await writeManifest(manifestDir)
      const registryKey = `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${hostName}`
      await exec(`reg add "${registryKey}" /ve /t REG_SZ /d "${manifestPath}" /f`, {
        stdio: 'inherit',
      })
      break
    }
    default:
      return
  }
}

async function main() {
  const extensionIdsArg = process.argv[2]
  if (!extensionIdsArg) {
    console.error('Must pass in csv of allowed extension IDs')
    process.exit(1)
  }

  const extensionIds = extensionIdsArg.split(',')
  await createSEA()
  await installConfig(extensionIds)
}

main()
