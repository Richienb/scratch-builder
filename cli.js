#!/usr/bin/env node
"use strict"

require("v8-compile-cache") // eslint-disable-line import/no-unassigned-import
const { promises: fs } = require("fs")
const path = require("path-extra")
const ora = require("ora")
const meow = require("meow")
const buildHtml = require("./lib/build-html")
const buildBinaries = require("./lib/build-binaries")
const projectName = require("./lib/project-name")

const cli = meow(`
    Usage
      $ scratch-builder <input>

    Examples
      $ scratch-builder 416145234
`, {
	inferType: true
})

const [source] = cli.input

module.exports = (async () => {
	const spinner = ora("Starting build").start()
	const title = typeof source === "number" ? await projectName(source) : path.base(source)
	const buildDirectory = path.join(__dirname, "build")

	await fs.mkdir(buildDirectory, { recursive: true })

	spinner.text = "Building HTML"

	const outputHtml = typeof source === "number" ? await buildHtml.fromId(source) : await buildHtml.fromFile(source)
	await fs.writeFile(path.join(buildDirectory, `${title}.html`), outputHtml)

	spinner.text = "Building binaries"

	await buildBinaries({ files: path.join(buildDirectory, `${title}.html`), appName: title, buildDir: buildDirectory })

	spinner.stop()
})()
