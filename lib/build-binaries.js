const { promises: fs } = require("fs")
const writeJsonFile = require("write-json-file")
const findCacheDir = require("find-cache-dir")
const tempy = require("tempy")
const path = require("path")
const { createWindowsInstaller } = require("electron-winstaller")
const camelcase = require("camelcase")
const NWBuilder = require("nw-builder")

module.exports = async ({ title, buildDirectory, width, projectData }) => {
	const temporaryDirectory = tempy.directory()

	await writeJsonFile(path.join(temporaryDirectory, "package.json"), {
		name: "scratch-builder",
		version: "1.0.0",
		private: true,
		main: path.join(buildDirectory, `${title}.html`),
		window: {
			// Icon: "app.icns",
			width,
			height: 360
		}
	}, { indent: undefined })

	await fs.writeFile(path.join(temporaryDirectory, "index.html"), `${await fs.readFile(path.join(buildDirectory, `${title}.html`), "utf8")}
<script>
nw.App.registerGlobalHotKey(new nw.Shortcut({
  key: "F11",
  active: () => {
    nw.Window.get().toggleFullscreen();
  }
}));
</script>`)

	const nw = new NWBuilder({
		// Platforms: ['win32', 'win64', 'osx64', 'linux32', 'linux64'],
		files: [path.join(temporaryDirectory, "index.html"), path.join(temporaryDirectory, "package.json")],
		platforms: ["win64"],
		flavor: "normal",
		cacheDir: path.join(findCacheDir({ name: "scratch-builder", create: true }), "nw-builder"),
		buildDir: temporaryDirectory,
		appName: title
	})

	await nw.build()

	await fs.mkdir(path.join(temporaryDirectory, title, "win64", "resources"))
	await fs.rename(path.join(temporaryDirectory, title, "win64", "credits.html"), path.join(temporaryDirectory, title, "win64", "LICENSE"))

	await createWindowsInstaller({
		appDirectory: path.join(temporaryDirectory, title, "win64"),
		outputDirectory: path.join(temporaryDirectory, "build", title, "win64"),
		authors: projectData && projectData.author.username || "Scratcher", // TODO: Use optional chaining when supported.
		exe: `${title}.exe`,
		title,
		usePackageJson: false,
		version: "1.0.0",
		name: camelcase(title, { pascalCase: true }),
		description: projectData && projectData.instructions || "A Scratch project.",
		loadingGif: path.join(__dirname, "spinner.gif")
	})

	await fs.copyFile(path.join(temporaryDirectory, "build", title, "win64", "Setup.exe"), path.join(buildDirectory, `${title} Installer (Windows x64).exe`))

	try {
		await fs.unlink(temporaryDirectory)
	} catch (_) { }
}
