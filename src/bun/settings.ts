import { Utils } from "electrobun/bun";
import * as fs from "fs";
import * as path from "path";

export interface AppSettings {
	instanceUrl: string;
	windowBounds: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	closeToTray: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
	instanceUrl: "",
	windowBounds: {
		x: 200,
		y: 200,
		width: 1200,
		height: 800,
	},
	closeToTray: true,
};

function getSettingsPath(): string {
	const dir = Utils.paths.userData;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	return path.join(dir, "settings.json");
}

export function loadSettings(): AppSettings {
	const settingsPath = getSettingsPath();
	try {
		const raw = fs.readFileSync(settingsPath, "utf-8");
		const parsed = JSON.parse(raw) as Partial<AppSettings>;
		return { ...DEFAULT_SETTINGS, ...parsed };
	} catch {
		return { ...DEFAULT_SETTINGS };
	}
}

export function saveSettings(partial: Partial<AppSettings>): void {
	const current = loadSettings();
	const merged = { ...current, ...partial };
	const settingsPath = getSettingsPath();
	fs.writeFileSync(settingsPath, JSON.stringify(merged, null, "\t"), "utf-8");
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function saveWindowBoundsDebounced(
	bounds: AppSettings["windowBounds"],
): void {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		saveSettings({ windowBounds: bounds });
	}, 500);
}
