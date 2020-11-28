"use strict"
const path = require("path")
const {promises: fs} = require("fs")
const writeJsonFile = require("write-json-file")
const {generateSW: workbox} = require("workbox-build")
const buildManifest = require("./build-manifest")

module.exports = async ({title, html, buildDirectory, projectData}) => {
	await fs.writeFile(path.join(buildDirectory, "index.html"), html.replace("</title>", `</title><link rel="manifest" href="manifest.webmanifest">`) + `<script>if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js")</script>`)
	await writeJsonFile(path.join(buildDirectory, "manifest.webmanifest"), buildManifest({title, projectData}))

	await workbox({
		globDirectory: buildDirectory,
		globPatterns: [
			"**/*.{html,webmanifest}"
		],
		swDest: path.join(buildDirectory, "service-worker.js"),
		sourcemap: false
	})
}
