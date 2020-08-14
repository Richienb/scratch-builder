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

    Options
	  --widescreen, -w  Make the stage conform to a 16:9 aspect ratio.
	  --compatibility, -c Limit the framerate to 30fps. On by default.
	  --turbo, -t Run the scripts at the fastest possible speed.

    Examples
      $ scratch-builder 416145234
`, {
	inferType: true,
	flags: {
		widescreen: {
			type: "boolean",
			alias: "w"
		},
		compatibility: {
			type: "boolean",
			alias: "c",
			default: true
		},
		turbo: {
			type: "boolean",
			alias: "t"
		}
	}
})

const [source] = cli.input
const { widescreen, compatibility, turbo } = cli.flags

module.exports = (async () => {
	const spinner = ora("Starting build").start()
	const title = typeof source === "number" ? await projectName(source) : path.base(source)
	const buildDirectory = path.join(__dirname, "build")

	await fs.mkdir(buildDirectory, { recursive: true })

	spinner.text = "Building HTML"

	const width = widescreen ? 640 : 480

	const outputHtml = await buildHtml[typeof source === "number" ? "fromId" : "fromFile"](source, { title, width, compatibility, turbo })
	await fs.writeFile(path.join(buildDirectory, `${title}.html`), outputHtml)

	spinner.text = "Building binaries"

	await buildBinaries({ title, buildDirectory, width })

	spinner.stop()
})()
