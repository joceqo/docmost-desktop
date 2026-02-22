import Electrobun, {
	BrowserWindow,
	BrowserView,
	Tray,
	ApplicationMenu,
	Utils,
} from "electrobun/bun";
import type { SettingsRPCType } from "../rpc-types";
import {
	loadSettings,
	saveSettings,
	saveWindowBoundsDebounced,
} from "./settings";

// ─── State ───────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const settings = loadSettings();

// ─── RPC for Settings UI ─────────────────────────────────────────────
const settingsRPC = BrowserView.defineRPC<SettingsRPCType>({
	maxRequestTime: 10000,
	handlers: {
		requests: {
			saveSettings: ({ url }) => {
				try {
					new URL(url);
				} catch {
					return { success: false, error: "Invalid URL format" };
				}

				saveSettings({ instanceUrl: url });
				settings.instanceUrl = url;

				// Close settings and open main window
				setTimeout(() => {
					settingsWindow?.close();
					settingsWindow = null;
					openMainWindow();
				}, 100);

				return { success: true };
			},
			getSettings: () => {
				if (settings.instanceUrl) {
					return { url: settings.instanceUrl };
				}
				return null;
			},
		},
		messages: {},
	},
});

// ─── Windows ─────────────────────────────────────────────────────────
function openSettingsWindow(): void {
	if (settingsWindow) {
		settingsWindow.focus();
		return;
	}

	settingsWindow = new BrowserWindow({
		title: "Docmost Desktop - Setup",
		url: "views://settings-ui/index.html",
		frame: { width: 500, height: 450, x: 300, y: 200 },
		rpc: settingsRPC,
	});

	settingsWindow.on("close", () => {
		settingsWindow = null;
		// If no main window and no URL configured, quit
		if (!mainWindow && !settings.instanceUrl) {
			Utils.quit();
		}
	});
}

function openMainWindow(): void {
	if (!settings.instanceUrl) {
		openSettingsWindow();
		return;
	}

	if (mainWindow) {
		mainWindow.focus();
		return;
	}

	const { x, y, width, height } = settings.windowBounds;

	mainWindow = new BrowserWindow({
		title: "Docmost",
		url: settings.instanceUrl,
		frame: { width, height, x, y },
		partition: "persist:docmost-session",
	});

	// Window state persistence
	mainWindow.on("resize", (event) => {
		const d = event.data as {
			id: number;
			x: number;
			y: number;
			width: number;
			height: number;
		};
		saveWindowBoundsDebounced({
			x: d.x,
			y: d.y,
			width: d.width,
			height: d.height,
		});
	});

	mainWindow.on("move", (event) => {
		const d = event.data as {
			id: number;
			x: number;
			y: number;
			width: number;
			height: number;
		};
		saveWindowBoundsDebounced({
			x: d.x,
			y: d.y,
			width: d.width,
			height: d.height,
		});
	});

	// Disable right-click context menu and fix scrolling for Mantine AppShell
	mainWindow.webview.on("dom-ready", () => {
		mainWindow?.webview.executeJavascript(`
			document.addEventListener('contextmenu', e => e.preventDefault());
			const style = document.createElement('style');
			style.textContent = \`
				html, body { height: 100% !important; overflow: hidden !important; }
				.mantine-AppShell-main {
					overflow-y: auto !important;
					-webkit-overflow-scrolling: touch !important;
					max-height: 100vh !important;
				}
				.ProseMirror { overflow-y: auto !important; }
			\`;
			document.head.appendChild(style);
		`);
	});

	// Close-to-tray: when window closes, we lose the reference
	// The user can re-open from tray
	mainWindow.on("close", () => {
		mainWindow = null;
	});
}

// ─── System Tray ─────────────────────────────────────────────────────
function setupTray(): void {
	tray = new Tray({
		title: "Docmost",
		template: true,
		width: 18,
		height: 18,
	});

	tray.on("tray-clicked", () => {
		tray!.setMenu([
			{
				type: "normal",
				label: "Show Docmost",
				action: "show",
			},
			{
				type: "normal",
				label: "Settings...",
				action: "settings",
			},
			{ type: "divider" },
			{
				type: "normal",
				label: "Quit",
				action: "quit",
			},
		]);
	});

	tray.on("tray-item-clicked", (e) => {
		const { action } = e.data as { action: string };
		switch (action) {
			case "show":
				if (mainWindow) {
					mainWindow.focus();
				} else {
					openMainWindow();
				}
				break;
			case "settings":
				openSettingsWindow();
				break;
			case "quit":
				Utils.quit();
				break;
		}
	});
}

// ─── Application Menu ────────────────────────────────────────────────
function setupMenu(): void {
	ApplicationMenu.setApplicationMenu([
		{
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{
					label: "Settings...",
					action: "open-settings",
					accelerator: "Cmd+,",
				},
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideOthers" },
				{ role: "showAll" },
				{ type: "separator" },
				{
					label: "Quit Docmost Desktop",
					action: "quit-app",
					accelerator: "Cmd+Q",
				},
			],
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "pasteAndMatchStyle" },
				{ role: "selectAll" },
			],
		},
		{
			label: "View",
			submenu: [
				{
					label: "Reload",
					action: "reload",
					accelerator: "Cmd+R",
				},
				{ type: "separator" },
				{
					label: "Actual Size",
					action: "zoom-reset",
					accelerator: "Cmd+0",
				},
				{
					label: "Zoom In",
					action: "zoom-in",
					accelerator: "Cmd+=",
				},
				{
					label: "Zoom Out",
					action: "zoom-out",
					accelerator: "Cmd+-",
				},
				{ type: "separator" },
				{ role: "toggleFullScreen" },
				],
		},
		{
			label: "Window",
			submenu: [
				{ role: "minimize" },
				{ role: "zoom" },
				{ type: "separator" },
				{ role: "bringAllToFront" },
			],
		},
	]);

	Electrobun.events.on("application-menu-clicked", (e) => {
		const { action } = e.data as { action: string };
		switch (action) {
			case "open-settings":
				openSettingsWindow();
				break;
			case "reload":
				if (mainWindow && settings.instanceUrl) {
					mainWindow.webview.loadURL(settings.instanceUrl);
				}
				break;
			case "quit-app":
				Utils.quit();
				break;
		}
	});
}

// ─── Bootstrap ───────────────────────────────────────────────────────
setupMenu();
setupTray();

if (settings.instanceUrl) {
	openMainWindow();
} else {
	openSettingsWindow();
}

console.log("Docmost Desktop started");
