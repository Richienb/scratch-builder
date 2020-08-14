const puppeteer = require("puppeteer")
const path = require("path-extra")
const { minify: minifyHtml } = require("html-minifier")
const projectName = require("./project-name")

// TODO: Take title as input

const buildHtml = async options => {
	options = {
		username: "Player",
		fullscreen: false,
		progressBar: false,
		noLimits: true,
		transparentMonitors: true,
		compatibility: true,
		...options
	}

	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto(`file:${path.join(__dirname, "vendor", "htmlifier-offline.html")}`)

	if (options.filename) {
		const fileInput = await page.$("#file")
		await fileInput.uploadFile(options.filename)
	}

	const result = await page.evaluate(async options => {
		/* eslint-disable no-undef */
		document.querySelector("#compatibility").checked = options.compatibility
		document.querySelector("#autodownload").checked = false
		if (options.filename) {
			options.file = document.querySelector("#file").files[0]
		}

		const blob = await downloadAsHTML(options, options)
		return blob.text()
		/* eslint-enable no-undef */
	}, options)

	browser.close()

	return minifyHtml(result, {
		collapseBooleanAttributes: true,
		collapseInlineTagWhitespace: true,
		collapseWhitespace: true,
		decodeEntities: true,
		minifyCSS: true,
		minifyJS: true,
		processConditionalComments: true,
		removeAttributeQuotes: true,
		removeComments: true,
		removeEmptyAttributes: true,
		removeOptionalTags: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true
	})
}

exports.fromFile = async (filename, options) => buildHtml({ title: path.base(filename), filename, ...options })

exports.fromId = async (id, options) => buildHtml({ title: await projectName(id), id: id.toString(), ...options })
