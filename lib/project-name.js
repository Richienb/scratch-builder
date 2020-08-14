const got = require("got")

module.exports = async id => {
	try {
		const { body: result } = await got(id.toString(), {
			prefixUrl: "https://api.scratch.mit.edu/projects",
			responseType: "json"
		})
		return result.title
	} catch (_) {
		return "Project"
	}
}
