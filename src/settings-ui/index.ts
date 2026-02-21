import { Electroview } from "electrobun/view";
import type { SettingsRPCType } from "../rpc-types";

const rpc = Electroview.defineRPC<SettingsRPCType>({
	handlers: {
		requests: {},
		messages: {
			settingsSaved: ({ url }) => {
				console.log("Settings saved, connecting to:", url);
			},
		},
	},
});

// Instantiate Electroview to connect the WebSocket transport
new Electroview({ rpc });

const form = document.getElementById("settings-form") as HTMLFormElement;
const urlInput = document.getElementById("url-input") as HTMLInputElement;
const connectBtn = document.getElementById("connect-btn") as HTMLButtonElement;
const errorMsg = document.getElementById("error-msg") as HTMLParagraphElement;

// Load existing settings once WebSocket is connected
// Small delay to ensure transport is ready
setTimeout(async () => {
	try {
		const settings = await rpc.request.getSettings({});
		if (settings?.url) {
			urlInput.value = settings.url;
		}
	} catch {
		// Settings not available yet, that's fine for first run
	}
}, 500);

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	errorMsg.hidden = true;
	connectBtn.disabled = true;
	connectBtn.textContent = "Connecting...";

	const url = urlInput.value.trim().replace(/\/+$/, "");

	try {
		const result = await rpc.request.saveSettings({ url });
		if (!result.success) {
			throw new Error(result.error ?? "Failed to save settings");
		}
	} catch (err) {
		errorMsg.textContent =
			err instanceof Error ? err.message : "Something went wrong";
		errorMsg.hidden = false;
		connectBtn.disabled = false;
		connectBtn.textContent = "Save & Connect";
	}
});
