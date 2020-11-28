"use strict"

module.exports = ({title, projectData}) => {
	return {
		name: title,
		description: projectData?.instructions,
		scope: "index.html",
		start_url: "index.html",
		display: "fullscreen",
		background_color: "#000000",
		theme_color: "#000000"
	}
}
