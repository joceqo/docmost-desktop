import type { RPCSchema } from "electrobun/bun";

export type SettingsRPCType = {
	bun: RPCSchema<{
		requests: {
			saveSettings: {
				params: { url: string };
				response: { success: boolean; error?: string };
			};
			getSettings: {
				params: Record<string, never>;
				response: { url: string } | null;
			};
		};
		messages: Record<string, never>;
	}>;
	webview: RPCSchema<{
		requests: Record<string, never>;
		messages: {
			settingsSaved: { url: string };
		};
	}>;
};
