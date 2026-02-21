import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Docmost Desktop",
		identifier: "com.docmost.desktop",
		version: "0.1.0",
	},
	build: {
		views: {
			"settings-ui": {
				entrypoint: "src/settings-ui/index.ts",
			},
		},
		copy: {
			"src/settings-ui/index.html": "views/settings-ui/index.html",
			"src/settings-ui/style.css": "views/settings-ui/style.css",
			"src/assets/icon.png": "views/settings-ui/icon.png",
		},
		mac: {
			bundleCEF: false,
			icons: "icon.iconset",
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
