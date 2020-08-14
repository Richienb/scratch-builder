const { promises: fs } = require("fs")
const writeJsonFile = require("write-json-file")
const findCacheDir = require("find-cache-dir")
const path = require("path")
const NWBuilder = require("nw-builder")

module.exports = async options => {
	const nw = new NWBuilder({
		// platforms: ['win32', 'win64', 'osx64', 'linux32', 'linux64'],
		platforms: ["win64"],
		flavor: "normal",
		cacheDir: path.join(findCacheDir({ name: 'scratch-builder', create: true }), "nw-builder"),
		...options
	})

	await writeJsonFile(path.join(options.buildDir, "package.json"), {
		name: "scratch-builder",
		version: "1.0.0",
		private: true,
		description: "Temporary build file.",
		main: "index.html",
		window: {
			// icon: "app.icns",
			width: 480,
			height: 360
		}
	}, { indent: undefined })

	await nw.build()

	await fs.unlink(path.join(options.buildDir, "package.json"))
}
