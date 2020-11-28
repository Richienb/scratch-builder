#!/usr/bin/env node
"use strict"

const {promises: fs} = require("fs")
const path = require("path")
const filename = require("file-name")
const ora = require("ora")
const meow = require("meow")
const buildHtml = require("./lib/build-html")
const buildPwa = require("./lib/build-pwa")
const scratchInfo = require("./lib/scratch-info")

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
const {widescreen, compatibility, turbo} = cli.flags

module.exports = (async () => {
	const spinner = ora("Starting build").start()
	const projectData = await scratchInfo(source)
	const title = typeof source === "number" ? projectData.title || "Scratch Project" : filename(source)
	const buildDirectory = path.join(__dirname, "build")

	await fs.mkdir(buildDirectory, {recursive: true})

	spinner.text = "Building HTML"

	const width = widescreen ? 640 : 480

	const outputHtml = await buildHtml[typeof source === "number" ? "fromId" : "fromFile"](source, {title, width, compatibility, turbo})

	spinner.text = "Building binaries"

	await buildPwa({title, html: outputHtml, projectData, buildDirectory})

	spinner.stop()
})()
