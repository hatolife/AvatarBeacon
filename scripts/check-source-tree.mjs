#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] ?? '.')
const required = [
  'README.md',
  'LICENSE',
  'Assets/PoppoWorks/AvatarBeacon',
  'Assets/PoppoWorks/AvatarBeacon/README.md',
  'Assets/PoppoWorks/AvatarBeacon/Version.txt',
  'Assets/PoppoWorks/AvatarBeacon/LICENSES/AvatarBeacon-MIT.txt',
  'Assets/PoppoWorks/AvatarBeacon/LICENSES/YL-ATG-MIT.txt',
  'Assets/PoppoWorks/AvatarBeacon/NOTICE.md',
  'Assets/PoppoWorks/AvatarBeacon/Prefabs/AvatarBeacon_main.prefab',
  'Assets/PoppoWorks/AvatarBeacon/Prefabs/AvatarBeacon_12.prefab',
]

const unexpectedPatterns = [
  /(^|[/\\])Library([/\\]|$)/,
  /(^|[/\\])Temp([/\\]|$)/,
  /VRCSDK/i,
  /Modular[ _-]?Avatar/i,
  /ModularAvatar/i,
  /\.unitypackage$/i,
]

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath))
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

let failed = false
for (const relativePath of required) {
  if (!exists(relativePath)) {
    console.error(`Required AvatarBeacon source file was not found: ${relativePath}`)
    failed = true
  }
}

const files = exists('Assets') ? walk(path.join(root, 'Assets')) : []
for (const file of files) {
  const relativePath = path.relative(root, file)
  if (unexpectedPatterns.some((pattern) => pattern.test(relativePath))) {
    console.error(`Unexpected file in AvatarBeacon source tree: ${relativePath}`)
    failed = true
  }
}

if (failed) {
  process.exit(1)
}

console.log(`AvatarBeacon source tree OK: ${root}`)
