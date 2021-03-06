/**
 * @name MemeSounds
 * @version 0.5.9
 * @description Plays Memetastic sounds depending on what is being sent in chat. This was heavily inspired by the idea of Metalloriff's bruh plugin so go check him out!
 * @invite YMqKjWEVxG
 * @author Lonk#6942
 * @authorId 
 * @authorLink https://github.com/Lonk12/
 * @source https://github.com/HeyMika/MemeSounds/blob/main/MemeSounds/MemeSounds.plugin.js
 * @updateUrl https://raw.githubusercontent.com/HeyMika/MemeSounds/main/MemeSounds/MemeSounds.plugin.js
 */

module.exports = (() => {
	
	/* Configuration */
	const config = {info: {name: "Meme Sounds", authors: [{name: "Lonk#6942", discord_id: "557388558017495046", github_username: "Lonk12", twitter_username: "wolfyypaw"},{name: "FlyMaster#2642", discord_id: "459726660359553025", github_username: "Apceniy"}], version: "0.5.9", description: "Plays Memetastic sounds depending on what is being sent in chat. This was heavily inspired by the idea of Metalloriff's bruh plugin so go check him out!", github: "https://github.com/Lonk12/BetterDiscordPlugins/blob/main/MemeSounds/MemeSounds.plugin.js", github_raw: "https://raw.githubusercontent.com/Lonk12/BetterDiscordPlugins/main/MemeSounds/MemeSounds.plugin.js"}, defaultConfig: [{id: "setting", name: "Sound Settings", type: "category", collapsible: true, shown: true, settings: [{id: "LimitChan", name: "Limit to the current channel only.", note: "When enabled, sound effects will only play within the currently selected channel.", type: "switch", value: true}, {id: "delay", name: "Sound effect delay.", note: "The delay in miliseconds between each sound effect.", type: "slider", value: 200, min: 10, max: 1000, renderValue: v => Math.round(v) + "ms"}, {id: "volume", name: "Sound effect volume.", note: "How loud the sound effects will be.", type: "slider", value: 1, min: 0.01, max: 1, renderValue: v => Math.round(v*100) + "%"}]}], changelog: [{title: "New Stuff", items: ["simplified the code", "fixed oof and bruh sounds not playing", "fixed sound timings", "fixed sounds not being played in the order they are written", "fixed sound overlapping", "added volume slider in settings"]}]};

	/* Library Stuff */
	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
		load() {BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {confirmText: "Download Now", cancelText: "Cancel", onConfirm: () => {require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9"); await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));});}});}
		start() { }
		stop() { }
	} : (([Plugin, Api]) => {

		const plugin = (Plugin, Api) => { try {
			
			/* Constants */
			const {DiscordModules: {Dispatcher, SelectedChannelStore}} = Api;
			const sounds = [
				{re: /no?ice/gmi, file: "noice.mp3", duration: 600},
				{re: /bazinga/gmi, file: "bazinga.mp3", duration: 550},
				{re: /oof/gmi, file: "oof.mp3", duration: 250},
				{re: /bruh/gmi, file: "bruh.mp3", duration: 470},
				{re: /wth/gmi, file: "bruh what the hell bruh.mp3", duration: 470},
				{re: /what the hell/gmi, file: "bruh what the hell bruh.mp3", duration: 470},
				{re: /hell no/gmi, file: "Hell No WTF man.mp3", duration: 600},
				{re: /hell nah/gmi, file: "Hell No WTF man.mp3", duration: 600},
				{re: /men/gmi, file: "Hell No WTF man.mp3", duration: 600},
				{re: /hallelujah/gmi, file: "Hallelujah.mp3", duration: 470},
				{re: /yes/gmi, file: "Hallelujah.mp3", duration: 470},
				{re: /japanese/gmi, file: "Japanese Yoo.mp3", duration: 550},
				{re: /yo/gmi, file: "Japanese Yoo.mp3", duration: 550},
				{re: /hmm/gmi, file: "microwave noises.mp3", duration: 550},
				{re: /sus/gmi, file: "SUS Sound effect.mp3", duration: 550},
				{re: /bong/gmi, file: "taco-bell-bong-sfx.mp3", duration: 550},
				{re: /._./gmi, file: "taco-bell-bong-sfx.mp3", duration: 550},
				{re: /cum/gmi, file: "this is my cum.mp3", duration: 550},
				{re: /hi/gmi, file: "trumpet.mp3", duration: 550},
				{re: /wow/gmi, file: "vine boom.mp3", duration: 550},
				{re: /ey/gmi, file: "vine boom.mp3", duration: 550},
				{re: /digga/gmi, file: "vine boom.mp3", duration: 550},
				{re: /rly/gmi, file: "vine boom.mp3", duration: 550},
				{re: /huan/gmi, file: "vine boom.mp3", duration: 550},
				{re: /kys/gmi, file: "vine boom.mp3", duration: 550},
				{re: /boi/gmi, file: "BABABOOEY Sound Effect.m4a", duration: 550},
				{re: /bababoi/gmi, file: "BABABOOEY Sound Effect.m4a", duration: 550},
				{re: /bababooey/gmi, file: "BABABOOEY Sound Effect.m4a", duration: 550},
				{re: /baba/gmi, file: "BABABOOEY Sound Effect.m4a", duration: 550},
			];

			/* Double message event fix */
			let lastMessageID = null;

			/* Meme Sounds Class */
			return class MemeSounds extends Plugin {
				constructor() {
					super();
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
	
				onStart() {
					Dispatcher.subscribe("MESSAGE_CREATE", this.messageEvent);
				}
				
				messageEvent = async ({ channelId, message, optimistic }) => {
					if (this.settings.setting.LimitChan && channelId != SelectedChannelStore.getChannelId())
						return;

					if (!optimistic && lastMessageID != message.id) {
						lastMessageID = message.id;
						let queue = new Map();
						for (let sound of sounds) {
							for (let match of message.content.matchAll(sound.re))
								queue.set(match.index, sound);
						}
						for (let sound of [...queue.entries()].sort((a, b) => a[0] - b[0])) {
							let audio = new Audio("https://github.com/HeyMika/MemeSounds/raw/main/MemeSounds/Sounds/"+sound[1].file);
							audio.volume = this.settings.setting.volume;
							audio.play();
							await new Promise(r => setTimeout(r, sound[1].duration+this.settings.setting.delay));
						}
					}
					
				};
				
				onStop() {
					Dispatcher.unsubscribe("MESSAGE_CREATE", this.messageEvent);
				}
			}
		} catch (e) { console.error(e); }};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
