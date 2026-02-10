//////////// ORDER OF ITEMS IN SCRIPT ////////////////

// DECLARE GLOBAL VARIABLES //
// DECLARE POSITION VARIABLES //
// GET LIVE PLAYER POINTS //
// APPEND HTML TO INSERT SCOREBOARD //
// GET PLAYER POSITIONS - run on initial load (if variable is true) , do not run on different weeks- do not run on refresh //
// PARSE ARRAYS //
// GET PROJECTIONS - run on initial load , select different weeks- do not run on refresh //
// GET LIVE SCORING DETAILS - run on initial load , select different weeks and refresh //
// API LOAD ALL DATA - INITIAL LOAD //
// LISTENER TO RUN SCRIPS //
// BUILD SELECT WEEK AND CHECK BOXES HTML //
// FUNCTIONS FOR CHECKBOXES //
// GET LIVE STATS - run on initial load , select different weeks and refresh - do not run on future weeks //
// BUILD NFL BOX SCORES //
// FORMAT KICKOFF TIMESTAMP //
// CLICK ON EACH NFL TEAM MATCHUP AND DISPLAY PLAYER GAME DETAILS //
// CLICK FOR PLAYER STATS DATA //
// REMOVE NFL MATCHUP DETAILS POPUP BOX //
// FORMAT PLAYERS NAMES //
// CREATE FANTASY MATCHUP BOXES FOR SCROLL BAR //
// CLICK EACH FRANCHISE MATCHUP //
// TOUCH MOVE FOR PLAYERS BOX MATCHUPS - there are 4 of these functions //
// PARSE LIVE STATS DATA FOR TEAMS //
// PARSE LIVE STATS DATA FOR PLAYERS //
// LOAD PLAYER FANTASY MATCHUPS //
// REBUILD PLAYER ROW ON CLICK OR SWIPE //
// CREATE SCOREBOARD NUMBERS //
// CREATE SCOREBOARD GLOBAL CSS //

// DECLARE GLOBAL VARIABLES //
if (typeof lsm_use_probability === "undefined") var lsm_use_probability = false;
if (typeof ScoringTimezone === "undefined") var ScoringTimezone = "LOCAL";
if (typeof lsShowNFLbox === "undefined") var lsShowNFLbox = true;
if (typeof lsUseProjections === "undefined") var lsUseProjections = true;
if (typeof lsm_customPositions === "undefined") var lsm_customPositions = false;
if (typeof lsm_swipe === "undefined") var lsm_swipe = true;
if (typeof lsm_byeMatchups === "undefined") var lsm_byeMatchups = false;
if (typeof lsm_hideTeamsNoPlayers === "undefined") var lsm_hideTeamsNoPlayers = false;
if (typeof lsAppearance === "undefined") var lsAppearance = 2;
if (typeof lsm_hideIDP === "undefined") var lsm_hideIDP = false;
if (typeof lsm_hidePunt === "undefined") var lsm_hidePunt = false;
if (typeof lsAppearanceBox === "undefined") var lsAppearanceBox = 2;
if (typeof rowCount === "undefined") var rowCount = 200;
if (typeof lsmPMR === "undefined") var lsmPMR = true;
if (typeof lsmHPM === "undefined") var lsmHPM = '22';
let isRequestInProgress = false;
let xDown = null;
let yDown = null;
let LSMmatchupIndex = 0;
let totalMatchups = 0;
let lsm_last_update = 0;
let lsmNFLmatchups = [];
let lsm_playerDatabase = [];
let show_defStats = ["SK", "SF", "TPA"];
let show_offStats = ["RY", "PY"];
let ls_stats = [];
let ls_tstats = [];
let LSMLiveScoring = [];
const LSMminStartersBase = leagueAttributes['MinStarters'];
if (real_ls_week >= endWeek) real_ls_week = endWeek;
let currentWeekLSModule = real_ls_week;
let LSMcurrentWeek;
let LSMpreviousWeek;
let LSMfutureWeek;
let matchupContent = {};
let matchupGame = {};
let injuryArray = '';
let matchingInjury = '';
let lsmUpdateCount = 0;
var ls_explain = "";
let lsmNFLschedule = null;
let lsmScheduleWeek = null;
let lsmPlayersLoadedWeek = null;
let lsm_noNFLGames = false;
const LSMplayerScoresByWeek = {};
let show_math = [];
let lsmTimeZone = "";
if (ScoringTimezone === "ET") {
	lsmTimeZone = "ET";
} else if (ScoringTimezone === "LOCAL") {
	lsmTimeZone = "";
} else if (ScoringTimezone === "PT") {
	lsmTimeZone = "PT";
} else if (ScoringTimezone === "MT") {
	lsmTimeZone = "MT";
} else if (ScoringTimezone === "CT") {
	lsmTimeZone = "CT";
} else if (ScoringTimezone === "AKT") {
	lsmTimeZone = "AKT";
} else if (ScoringTimezone === "HT") {
	lsmTimeZone = "HT";
} else {
	lsmTimeZone = "";
}
var totalTime = leagueAttributes['MaxStarters'] * 60;
if (typeof franchise_id !== "undefined") {
	if (franchise_id === "0000") {
		if (typeof lsmComFranchise === "undefined") {
			lsmComFranchise = "0001";
		}
	} else {
		if (typeof lsmComFranchise === "undefined") {
			lsmComFranchise = franchise_id;
		}
	}
} else {
	lsmComFranchise = "";
}
window.lsm_anyHiddenStarters = false;

function hasOwn(obj, key) {
	return obj != null && Object.prototype.hasOwnProperty.call(obj, key);
}

function LSPlayer(id, name, pos, nfl_team, lpos) {
	this.id = id;
	this.name = name.replace(/ /g, '&nbsp;');
	this.pos = pos;
	this.nfl_team = nfl_team;
	this.lpos = lpos;
}

function format_points(points) {
	points = points + 0.00000001;
	var pstr = points.toFixed(1);
	return (pstr);
}

function update_player_points(pid, playerObject) {
	const key = pid == null ? "" : String(pid);

	// make sure show_math exists
	if (typeof show_math === "object" && show_math) show_math[key] = "";

	// Prefer ls_player when present
	const lp = (typeof ls_player === "object" && ls_player) ? ls_player[key] : null;

	// Fallback to LSMLiveScoring player data if ls_player missing
	const pos = lp?.pos ?? playerObject?.position ?? null;
	const nfl_team = lp?.nfl_team ?? playerObject?.team ?? null;

	// If we still don't have a position, we can't score reliably
	if (!pos) {
		const n = Number(playerObject?.score);
		return Number.isFinite(n) ? format_points(n) : format_points(0);
	}

	// Treat FA / missing team / missing game as 0
	if (!nfl_team || /^FA/.test(nfl_team) || !ls_nfl_games || ls_nfl_games[nfl_team] == null) {
		return format_points(0);
	}

	let points = 0;

	// Team defense style scoring (your LS uses "Def" sometimes)
	if (ls_team_pos?.[pos] == 1 && ls_tstats?.[nfl_team] != null) {
		points = score_player(nfl_team, pos);

		// Individual scoring
	} else if (ls_team_pos?.[pos] == 0 && ls_stats?.[key] != null) {
		points = score_player(key, pos);

	} else {
		// No stats found yet (or mismatch) â†’ keep LSMLiveScoring score as fallback
		const n = Number(playerObject?.score);
		return Number.isFinite(n) ? format_points(n) : format_points(0);
	}

	return format_points(points);
}

function ls_get_points(stat, val, lower, upper, form, bonus) {
	var points = 0;
	if (ls_list_cats[stat] || /,/.test(val)) {
		if (val != undefined) {
			var vals = val.split(",");
			for (var i in vals) {
				points += ls_get_points2(stat, vals[i], lower, upper, form, bonus);
			}
		}
	} else {
		points = ls_get_points2(stat, val, lower, upper, form, bonus);
	}
	return points;
}

function ls_get_points2(stat, val, lower, upper, form, bonus) {
	var points = 0;
	if (val == undefined) {
		return 0;
	}
	var nval = Number(val);
	var nlower = Number(lower);
	var nupper = Number(upper);
	var match = 0;
	if (/^[A-Z]/.test(val)) {
		if (nval == lower) {
			match = 1;
		}
	} else {
		if (!/&/.test(val)) {
			if (nval >= nlower && nval <= nupper) {
				match = 1;
			}
		} else {
			var comp = val.split("&");
			var comp1 = Number(comp[0]);
			var comp2 = Number(comp[1]);
			if (comp1 >= nlower && comp1 <= nupper &&
				comp2 >= nlower && comp2 <= nupper) {
				match = 1;
			}
		}
	}
	if (match == 1) {
		if (/^\*/.test(form)) {
			points = nval * Number(form.substr(1));
		} else if (/\//.test(form)) {
			var parts = form.split("/");
			var ppu = parts[0];
			var unit = parts[1];
			if (unit == "" || unit == undefined) {
				unit = 1;
			}
			var nppu = Number(ppu);
			var nunit = Number(unit);
			if (nunit == 0) {
				nunit = 1;
			}
			var hasdot = /\./;
			if (!hasdot.test(unit) && !hasdot.test(ppu)) {
				// both unit and mult are integers, use integer math
				if (bonus != undefined && bonus != "" && !/\//.test(stat)) {
					points = ((nval - nlower) / nunit) | 0;
					if (ppu != "" && !isNaN(nppu) && nppu != 0) {
						points *= nppu;
					}
					points += (Number(bonus)) | 0;
				} else {
					points = (nval / nunit) | 0;
					if (ppu != "" && !isNaN(nppu) && nppu != 0) {
						points *= nppu;
					}
				}
			} else if (!hasdot.test(unit) && hasdot.test(ppu)) {
				// unit is integer, mult isn't, use partial integer math
				if (bonus != undefined && bonus != "" && !/\//.test(stat)) {
					points = ((nval - nlower) / nunit) | 0;
					if (ppu != "" && !isNaN(nppu) && nppu != 0) {
						points *= nppu;
					}
					points += Number(bonus);
				} else {
					points = (nval / nunit) | 0;
					if (ppu != "" && !isNaN(nppu) && nppu != 0) {
						points *= nppu;
					}
				}
			} else {
				// both aren't integers
				if (bonus != undefined && bonus != "" && !/\//.test(stat)) {
					points = (nval - nlower) / nunit;
					if (ppu != "" && !isNaN(nppu) && nppu != 0) {
						points *= nppu;
					}
					points += Number(bonus);
				} else {
					points = nval / nunit;
					if (ppu != "" && !isNaN(nppu) && nppu != 0) {
						points *= nppu;
					}
				}
			}
		} else {
			points = Number(form);
		}
	}
	if (points != 0) {
		ls_explain = ls_explain + stat + "," + nval + "," + format_points(points) + "|";
	}
	return points;
}

// How long before we re-fetch from MFL (in ms)
const LS_SCORING_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchWithTimeout(url, ms = 10000) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), ms);
	try {
		return await fetch(url, {
			signal: ctrl.signal
		});
	} finally {
		clearTimeout(t);
	}
}

function getLsScoringCacheKey() {
	return `cache_ls_scoring_${year}_${league_id}`;
}

function safeParseObjectLiteralToJson(objLiteralText) {
	// Reject obvious executable constructs
	const forbidden = /(function|=>|\bnew\b|\bthis\b|\bwindow\b|\bdocument\b|\beval\b|\breturn\b|\bwhile\b|\bfor\b|\bclass\b)/;
	if (forbidden.test(objLiteralText)) return null;

	// Parentheses are rarely needed for pure data; reject for safety
	if (/[()]/.test(objLiteralText)) return null;

	let json = objLiteralText.trim();
	if (!json.startsWith("{") || !json.endsWith("}")) return null;

	// Quote unquoted keys: {a:1} -> {"a":1}
	json = json.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g, '$1"$2"$3');

	// Convert single-quoted strings to JSON double-quoted strings
	json = json.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (m, inner) => {
		const unescaped = inner.replace(/\\'/g, "'");
		const reescaped = unescaped.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
		return `"${reescaped}"`;
	});

	// Remove trailing commas
	json = json.replace(/,\s*([}\]])/g, "$1");

	try {
		return JSON.parse(json);
	} catch {
		return null;
	}
}

function parseLsAdjustContent(lsAdjustContent) {
	const out = Object.create(null);
	const lines = lsAdjustContent.split(/\r?\n/);

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;

		// Allow (and ignore) init line
		if (line === "var ls_adjust = [];" || line === "var ls_adjust=[];") continue;

		// Expected: ls_adjust["KEY"] = { ... };
		const m = line.match(/^ls_adjust\["([^"]+)"\]\s*=\s*(\{[\s\S]*\})\s*;\s*$/);
		if (!m) return null; // fail closed

		const key = m[1];
		const objLiteral = m[2];

		const parsed = safeParseObjectLiteralToJson(objLiteral);
		if (parsed == null) return null;

		out[key] = parsed;
	}

	return out;
}

// Actually apply the ls_nfl_games script + ls_adjust to the page
function applyScoringFunctions(lsNflGamesScript, lsAdjustContent) {

	// Rebuild ls_adjust if we extracted it separately
	if (lsAdjustContent) {
		try {
			const rebuilt = parseLsAdjustContent(lsAdjustContent);
			if (rebuilt) {
				// Same external availability as before
				window.ls_adjust = rebuilt;
			}
		} catch (e) {
			// swallow like before
		}
	}

	// Inject/replace the big "var ls_nfl_games = [] ... var ls_player..." script
	if (lsNflGamesScript) {

		// Prevent double-injection ONLY if it's the same script content
		// (Still allows replace when a new file/content is loaded)
		const s = String(lsNflGamesScript || "");
		const sig = s ? (s.length + ":" + s.slice(0, 80) + "::" + s.slice(-80)) : "";

		if (window._ls_scoring_applied_sig && window._ls_scoring_applied_sig === sig) return;
		window._ls_scoring_applied_sig = sig;

		const SCRIPT_ID = "lsm-ls-scoring-script";

		const scriptElement = document.createElement('script');
		scriptElement.type = 'text/javascript';
		scriptElement.id = SCRIPT_ID;
		scriptElement.textContent = lsNflGamesScript;

		const existing = document.getElementById(SCRIPT_ID);
		if (existing && existing.parentNode) {
			existing.parentNode.replaceChild(scriptElement, existing);
		} else {
			document.body.appendChild(scriptElement);
		}
	}
}

// Do the slow work: fetch + parse + extract. Used only on cold/expired cache.
async function downloadAndExtractScoringFunctions(url) {
	try {
		const response = await fetchWithTimeout(url, 10000);
		const data = await response.text();

		const doc = new DOMParser().parseFromString(data, "text/html");
		const scriptTags = doc.querySelectorAll("script");
		let lsNflGamesScript = null;
		let lsAdjustContent = '';

		scriptTags.forEach(tag => {
			const text = tag.textContent || "";

			// Full block containing "var ls_nfl_games = []" â€” this is your big script
			if (text.includes('var ls_nfl_games = []')) {
				lsNflGamesScript = text;
			}

			// Extract only ls_adjust initialization + assignments if present in any script
			if (text.includes('var ls_adjust')) {
				const initMatch = text.match(/var\s+ls_adjust\s*=\s*\[\];/);
				const assignMatches = text.match(/ls_adjust\[".*?"\]\s*=\s*{.*?};/g);

				if (initMatch) {
					lsAdjustContent += initMatch[0] + "\n";
				}
				if (assignMatches) {
					lsAdjustContent += assignMatches.join("\n") + "\n";
				}
			}
		});

		// Return what we found (may be null/empty if MFL changes stuff)
		return {
			lsNflGamesScript,
			lsAdjustContent
		};
	} catch (error) {
		// console.error('Error fetching scoring functions:', error);
		return {
			lsNflGamesScript: null,
			lsAdjustContent: ''
		};
	}
}

function hasAnyHiddenStarters() {
	if (!ls_rosters || typeof ls_rosters !== "object") return false;
	for (const fid in ls_rosters) {
		const hidden = Number(ls_rosters?.[fid]?.H);
		if (Number.isFinite(hidden) && hidden > 0) {
			return true;
		}
	}
	return false;
}

// Public entry point â€“ replace your existing fetchScoringFunctions with this.
async function fetchScoringFunctions() {
	//if (real_ls_week > endWeek || startWeek > real_ls_week) return;
	const url = `${baseURLDynamic}/${year}/ajax_ls?L=${league_id}&PRINTER=1`;
	const cacheKey = getLsScoringCacheKey();
	const now = Date.now();

	// ---- 1) Try fast path: use localStorage cache if present & fresh ----
	let cached;
	try {
		const raw = localStorage.getItem(cacheKey);
		if (raw) {
			cached = JSON.parse(raw);
		}
	} catch (e) {
		cached = null;
	}
	if (cached && typeof cached.ts === "number" && (now - cached.ts) < LS_SCORING_TTL_MS && cached.lsNflGamesScript) {
		applyScoringFunctions(cached.lsNflGamesScript, cached.lsAdjustContent);
		window.lsm_anyHiddenStarters = hasAnyHiddenStarters?.() || false;
		downloadAndExtractScoringFunctions(url).then(result => {
			if (result && result.lsNflGamesScript) {
				try {
					localStorage.setItem(
						cacheKey,
						JSON.stringify({
							ts: Date.now(),
							lsNflGamesScript: result.lsNflGamesScript,
							lsAdjustContent: result.lsAdjustContent || ''
						})
					);
				} catch (e) {}
			}
		}).catch(() => {});
		return;
	}
	const result = await downloadAndExtractScoringFunctions(url);
	if (result && result.lsNflGamesScript) {
		applyScoringFunctions(result.lsNflGamesScript, result.lsAdjustContent);
		try {
			localStorage.setItem(
				cacheKey,
				JSON.stringify({
					ts: now,
					lsNflGamesScript: result.lsNflGamesScript,
					lsAdjustContent: result.lsAdjustContent || ''
				})
			);
		} catch (e) {}
	}
}

// DECLARE POSITION VARIABLES //
var LSpos_team_imgs = ({
	"Coach": true,
	"Off": true,
	"Def": true,
	"ST": true,
	"TMQB": true,
	"TMRB": true,
	"TMWR": true,
	"TMTE": true,
	"TMPK": true,
	"TMPN": true,
	"TMDL": true,
	"TMLB": true,
	"TMDB": true
});
var LSPositionOrder = [
	"Coach",
	"QB",
	"TMQB",
	"RB",
	"TMRB",
	"WR",
	"TMWR",
	"TE",
	"TMTE",
	"PK",
	"TMPK",
	"PN",
	"TMPN",
	"Def",
	"Off",
	"ST",
	"TM",
	"DT",
	"DE",
	"TMDL",
	"LB",
	"TMLB",
	"S",
	"CB",
	"TMDB"
];

// Precompute index lookup so we don't call indexOf() for every player every refresh
const LSPositionOrderIndex = LSPositionOrder.reduce((map, pos, idx) => {
	map[pos] = idx;
	return map;
}, Object.create(null));


// APPEND HTML TO INSERT SCOREBOARD //
var LSMteamBoxOverlay = document.createElement('div');
LSMteamBoxOverlay.id = 'teamBoxOverlay';
LSMteamBoxOverlay.style.display = 'none';
LSMteamBoxOverlay.onclick = removeTeamBox;
var LSMteamBox = document.createElement('div');
LSMteamBox.id = 'teamBox';
LSMteamBox.style.display = 'none';
var LSMbody = document.getElementsByTagName('body')[0];
LSMbody.appendChild(LSMteamBoxOverlay);
LSMbody.appendChild(LSMteamBox);
if (lsShowNFLbox) {
	const newHTML = `<div id="lsmShowHide" style="display:none"><div id="LSModuleSettings"></div><div class="nfl-box-scroll-wrap"><div class="lsm-NFLgrid"></div></div><div class="matchup-box-scroll-wrap" style="width:100%;border-radius:0.188rem;text-align:center"></div><div id="LSscoringBox"></div></div>`;
	const _lsBoxA = document.querySelector('div#LSscoringBox');
	if (_lsBoxA) _lsBoxA.outerHTML = newHTML;
	var lsmNFLBox = document.querySelector('.lsm-NFLgrid');
} else {
	const newHTML = `<div id="lsmShowHide" style="display:none"><div id="LSModuleSettings"></div><div class="matchup-box-scroll-wrap" style="width:100%;border-radius:0.188rem;text-align:center"></div><div id="LSscoringBox"></div></div>`;
	const _lsBoxB = document.querySelector('div#LSscoringBox');
	if (_lsBoxB) _lsBoxB.outerHTML = newHTML;
}
var LSMSettingsContainer = document.querySelector('#LSModuleSettings');
var LSMmatchupBox = document.querySelector('.matchup-box-scroll-wrap');
var LSMhideShow = document.querySelector('#lsmShowHide');
var LSMscoringBox = document.querySelector('#LSscoringBox');
var LSMteamBox = document.querySelector('#teamBox');
var teamBoxOverlay = document.querySelector('#teamBoxOverlay');
var lsmShowHideElement = document.querySelector('.mobile-wrap #lsmShowHide');
if (lsmShowHideElement && lsmShowHideElement.parentNode) {
	var parentElement = lsmShowHideElement.parentNode;
	parentElement.parentNode.insertBefore(lsmShowHideElement, parentElement);
	parentElement.parentNode.removeChild(parentElement);
}

if (lsm_swipe && LSMscoringBox) {
	LSMscoringBox.addEventListener("touchstart", handleTouchStartLSModule, {
		passive: true,
		capture: false
	});
	LSMscoringBox.addEventListener("touchmove", handleTouchMoveLSModule, {
		passive: true,
		capture: false
	});
}

// GET PLAYER POSITIONS - run on initial load (if variable is true) , do not run on different weeks- do not run on refresh //
async function getLSMPlayers() {
	if (!lsm_customPositions) return;
	if (real_ls_week > endWeek || startWeek > real_ls_week) {
		LSMLiveScoring = [];
		return;
	}

	// If we already loaded players for this week, skip
	if (lsmPlayersLoadedWeek === real_ls_week && lsm_playerDatabase.players) return;

	const randomValue = Math.floor(Math.random() * 1000) + 1;
	const url = `${baseURLDynamic}/${year}/export?TYPE=players&L=${league_id}&JSON=1&random=${randomValue}`;
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("Network response was not ok");
		const data = await response.json();
		if (data.error) throw new Error(data.error.$t);

		lsm_playerDatabase.players = {};
		data.players.player.forEach(player => {
			lsm_playerDatabase.players[`pid_${player.id}`] = player;
		});

		lsmPlayersLoadedWeek = real_ls_week;
	} catch (error) {
		console.warn("Error getting playerDatabase - continue loading script.");
	}
}

function parseClockToSeconds(clock) {
	// "7:14" -> 434
	if (!clock || typeof clock !== "string") return null;
	const m = clock.match(/^(\d+):(\d{2})$/);
	if (!m) return null;
	const min = parseInt(m[1], 10);
	const sec = parseInt(m[2], 10);
	if (!Number.isFinite(min) || !Number.isFinite(sec)) return null;
	return (min * 60) + sec;
}

function quarterToGameSecondsRemaining(quarterRaw, remainingRaw) {
	const q = String(quarterRaw ?? "").trim();
	const r = String(remainingRaw ?? "").trim();

	// Finals / blank
	if (q === "" || q === "F" || q.toLowerCase() === "final") return 0;

	// Halftime-ish: treat as end of Q2
	if (q === "H" || q.toLowerCase() === "half time" || q.toLowerCase() === "halftime") {
		return 1800; // 2 quarters left
	}

	// Overtime-ish: if you want it to sort AFTER regulation games,
	// you can return a small number so it's "late"
	if (q === "O" || q.toLowerCase() === "overtime" || q.toLowerCase() === "ot") {
		const secLeft = parseClockToSeconds(r);
		return secLeft ?? 0; // OT remaining only (fine for sorting)
	}

	const qNum = parseInt(q, 10);
	const secLeftInQuarter = parseClockToSeconds(r);

	if (!Number.isFinite(qNum) || qNum < 1 || qNum > 4) return null;
	if (secLeftInQuarter == null) return null;

	// Remaining quarters AFTER current one
	const fullQuartersAfter = 4 - qNum;
	return (fullQuartersAfter * 15 * 60) + secLeftInQuarter;
}

function getScoreTotal(teamStat) {
	const tps = Number(teamStat?.TPS ?? 0) || 0;
	const tpa = Number(teamStat?.TPA ?? 0) || 0;
	return tps + tpa;
}

function getDriveKey(teamStat) {
	const down = String(teamStat?.DOWN ?? "");
	const togo = String(teamStat?.TOGO ?? "");
	const yard = String(teamStat?.YARDLINE ?? "");
	const poss = String(teamStat?.POSSESSION ?? "");
	return `${poss}|${down}|${togo}|${yard}`;
}

function parseTOPSeconds(mmss) {
	const s = String(mmss ?? "").trim();
	if (!s) return null;

	const parts = s.split(".");
	const min = parseInt(parts[0], 10);
	const sec = parseInt(parts[1] ?? "0", 10);

	if (!Number.isFinite(min) || !Number.isFinite(sec) || sec < 0 || sec >= 60) return null;
	return (min * 60) + sec;
}

function inferOTFromTeamStats(teamStatA, teamStatB) {
	const a = parseTOPSeconds(teamStatA?.TIME);
	const b = parseTOPSeconds(teamStatB?.TIME);
	if (a == null || b == null) return false;
	return (a + b) > 3600; // > 60:00
}

function seenOTLive(teamStat) {
	const q = String(teamStat?.QUARTER ?? "").toUpperCase();
	// handle "Overtime", "OT", "O"
	return (q === "OVERTIME" || q === "OT" || q === "O");
}

// PARSE ARRAYS //
function LSMparseArrays() {
	lsmNFLmatchups.forEach(matchup => {
		let kickoffTimestamp = parseInt(matchup.kickoff, 10);
		let formattedKickoff = formatKickoffTimestamp(kickoffTimestamp, ScoringTimezone);
		matchup.gameTime = formattedKickoff;
		if (completedWeek === real_ls_week || liveScoringWeek > real_ls_week || completedWeek > real_ls_week) {
			matchup.status = "FINAL";
			matchup.gameSecondsRemaining = "0";
			matchup.gameTime = "FINAL";
			matchup.team.forEach(team => {
				team.inRedZone = "false";
				team.hasPossession = "false";
				team.downDistance = "false";
			});
			// --- OVERTIME detection (latched per matchup) ---
			if (matchup.overtime === undefined) matchup.overtime = false;
			if (matchup.overtimeSource === undefined) matchup.overtimeSource = "";

			// Pull both teams' current tstats (if available)
			const t0id = matchup.team?.[0]?.id;
			const t1id = matchup.team?.[1]?.id;
			const t0 = t0id ? ls_tstats?.[t0id] : null;
			const t1 = t1id ? ls_tstats?.[t1id] : null;

			// 1) live OT seen?
			const liveOT = seenOTLive(t0) || seenOTLive(t1);

			// 2) final forensic OT via TOP sum > 60:00
			const topOT = inferOTFromTeamStats(t0, t1);

			// Latch it: once true, never goes false
			if (!matchup.overtime && (liveOT || topOT)) {
				matchup.overtime = true;
				matchup.overtimeSource = liveOT ? "live" : "top";
			}

		} else if (kickoffTimestamp > parseInt(lsm_last_update, 10)) {
			matchup.status = "SCHED";
			matchup.gameSecondsRemaining = "3600";
		} else {
			if (matchup.scoreChange === undefined) matchup.scoreChange = false;
			if (matchup.scoreChangeClock === undefined) matchup.scoreChangeClock = null;
			if (matchup._lastScoreTotal === undefined) matchup._lastScoreTotal = undefined;
			let matchupSecondsRemaining = null;
			let endRegBothZero = true;
			let endRegScores = [];

			matchup.team.forEach(team => {
				const teamId = team.id;

				if (hasOwn(ls_tstats, teamId)) {
					const teamStat = ls_tstats[team.id] ?? '';

					// ---- end of regulation candidate (needs BOTH teams) ----
					// If either team is not exactly Q4 + 0:00, we cannot use this shortcut.
					if (teamStat?.QUARTER === "4" && teamStat?.REMAINING === "0:00") {
						// If TPS is missing/blank at 0:00, do NOT treat as 0 (avoid false finals)
						if (teamStat?.TPS !== undefined && teamStat?.TPS !== null && teamStat?.TPS !== "") {
							const tps = Number(teamStat.TPS);
							if (Number.isFinite(tps)) {
								endRegScores.push(tps);
							} else {
								endRegBothZero = false;
							}
						} else {
							endRegBothZero = false;
						}
					} else {
						endRegBothZero = false;
					}

					if (teamStat.QUARTER == '' || teamStat.QUARTER == 'F' || teamStat.QUARTER == 'Final') {
						team.OPPscore = "0";
						team.score = "0";
						if (teamStat.TPS !== undefined && teamStat.TPS !== '') {
							team.score = teamStat.TPS || 0;
						}
						if (teamStat.TPA !== undefined && teamStat.TPA !== '') {
							team.OPPscore = teamStat.TPA || 0;
						}
						matchup.status = "FINAL";
						matchup.gameSecondsRemaining = "0";
						matchup.gameTime = "FINAL";
						team.inRedZone = "false";
						team.hasPossession = "false";
						team.downDistance = "false";
					} else {
						const gsr = quarterToGameSecondsRemaining(teamStat.QUARTER, teamStat.REMAINING);
						if (gsr != null) {
							// Use max to be resilient if one team's feed is lagging
							matchupSecondsRemaining = (matchupSecondsRemaining == null) ?
								gsr :
								Math.max(matchupSecondsRemaining, gsr);
						}

						// ---- score change detection (matchup-level) ----
						const firstTeamId = matchup.team?.[0]?.id;
						if (teamId && firstTeamId && teamId === firstTeamId) {
							const curTotal = getScoreTotal(teamStat);
							const prevTotal = matchup._lastScoreTotal;

							matchup._lastScoreTotal = curTotal;

							// Only trigger after we have a previous value,
							// only if not already locked,
							// and ONLY if points increased
							if (!matchup.scoreChange && typeof prevTotal === "number" && curTotal > prevTotal) {
								matchup.scoreChange = true;

								// snapshot clock at score moment (best known)
								matchup.scoreChangeClock = (matchupSecondsRemaining ?? gsr ?? null);

								// store what clock was at lock (optional, if you're unlocking via clock change)
								matchup._scoreChangeClockAtLock = matchup.scoreChangeClock;
							}
						}

						matchup.status = "INPROG";
						team.inRedZone = "false";
						team.hasPossession = "false";
						team.OPPscore = "0";
						team.score = "0";
						team.Quarter = "";
						team.Remaining = "";
						team.downDistance = "false";
						team.down_and_dist = '';
						let down = parseInt(teamStat.DOWN, 10);
						teamStat.down_and_dist = '';
						if (teamStat.TPS !== undefined && teamStat.TPS !== '') {
							team.score = teamStat.TPS || 0;
						}
						if (teamStat.TPA !== undefined && teamStat.TPA !== '') {
							team.OPPscore = teamStat.TPA || 0;
						}
						if (teamStat.QUARTER === "2" && teamStat.REMAINING === "2:00" || teamStat.QUARTER === "2" && teamStat.REMAINING === "1:59" || teamStat.QUARTER === "2" && teamStat.REMAINING === "1:58") {
							team.Quarter = "Two-Minute Warning";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "1" && teamStat.REMAINING === "0:00") {
							team.Quarter = "End of 1st Q";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "2" && teamStat.REMAINING === "0:00" || teamStat.QUARTER === "Half Time" || teamStat.QUARTER === "H" || teamStat.QUARTER === "Halftime") {
							team.Quarter = "";
							team.Remaining = "Halftime";
						} else if (teamStat.QUARTER === "3" && teamStat.REMAINING === "0:00") {
							team.Quarter = "End of 3rd Q";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "1" && teamStat.REMAINING === "15:00") {
							team.Quarter = "Opening Kickoff";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "2" && teamStat.REMAINING === "15:00") {
							team.Quarter = "Start of 2nd Quarter";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "3" && teamStat.REMAINING === "15:00") {
							team.Quarter = "Start of 3rd Quarter";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "4" && teamStat.REMAINING === "15:00") {
							team.Quarter = "Start of 4th Quarter";
							team.Remaining = "";
						} else if (teamStat.QUARTER == 'F' || teamStat.QUARTER == 'Final') {
							matchup.status = "FINAL";
							matchup.gameSecondsRemaining = "0";
							matchup.gameTime = "FINAL";
							team.inRedZone = "false";
							team.hasPossession = "false";
							team.downDistance = "false";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "1") {
							team.Quarter = " - 1st";
							team.Remaining = teamStat.REMAINING ?? 0;
						} else if (teamStat.QUARTER === "2") {
							team.Quarter = " - 2nd";
							team.Remaining = teamStat.REMAINING ?? 0;
						} else if (teamStat.QUARTER === "3") {
							team.Quarter = " - 3rd";
							team.Remaining = teamStat.REMAINING ?? 0;
						} else if (teamStat.QUARTER === "4" && teamStat.REMAINING === "2:00" || teamStat.QUARTER === "4" && teamStat.REMAINING === "1:59" || teamStat.QUARTER === "4" && teamStat.REMAINING === "1:58") {
							team.Quarter = "Two-Minute Warning";
							team.Remaining = "";
						} else if (teamStat.QUARTER === "4") {
							team.Quarter = " - 4th";
							team.Remaining = teamStat.REMAINING ?? 0;
						} else if (teamStat.QUARTER === "Overtime" || teamStat.QUARTER === "O" || teamStat.QUARTER === "OT") {
							team.Quarter = " - OT";
							team.Remaining = teamStat.REMAINING ?? 0;
						} else {
							team.Quarter = '';
							team.Remaining = '';
						}
						if (isNaN(down) || down === 0 || down === undefined) {
							down = 1;
						}
						if (down === 1) {
							down = down + "st";
						} else if (down === 2) {
							down = down + "nd";
						} else if (down === 3) {
							down = down + "rd";
						} else if (down === 4) {
							down = down + "th";
						}
						if (teamStat.YARDLINE !== undefined && teamStat.YARDLINE !== "") {
							let fieldpos = teamStat.YARDLINE.split(":");
							let side = fieldpos[0];
							let yardline = Number(fieldpos[1]);
							if (side == '50') {
								side = "";
								yardline = 50;
							}
							if (teamStat.TOGO !== undefined && teamStat.TOGO !== "") {
								team.down_and_dist = down + " & " + teamStat.TOGO + " at " + side + " " + yardline;
								if (teamStat.POSSESSION > 0) {
									team.downDistance = "true";
									team.hasPossession = "true";
									if (side !== team.id && yardline < 20) {
										team.inRedZone = "true";
									}
								}
							}
						}
					}
				} else {
					matchup.status = "SCHED";
					endRegBothZero = false; // <-- critical: cannot be "end of regulation" if missing team feed
				}
			});


			// --- OVERTIME detection (latched per matchup) ---
			if (matchup.overtime === undefined) matchup.overtime = false;
			if (matchup.overtimeSource === undefined) matchup.overtimeSource = "";

			// Pull both teams' current tstats (if available)
			const t0id = matchup.team?.[0]?.id;
			const t1id = matchup.team?.[1]?.id;
			const t0 = t0id ? ls_tstats?.[t0id] : null;
			const t1 = t1id ? ls_tstats?.[t1id] : null;

			// 1) live OT seen?
			const liveOT = seenOTLive(t0) || seenOTLive(t1);

			// 2) final forensic OT via TOP sum > 60:00
			const topOT = inferOTFromTeamStats(t0, t1);

			// Latch it: once true, never goes false
			if (!matchup.overtime && (liveOT || topOT)) {
				matchup.overtime = true;
				matchup.overtimeSource = liveOT ? "live" : "top";
			}


			// ---- force FINAL if end of 4th at 0:00 AND not tied ----
			if (endRegBothZero && endRegScores.length === 2 && endRegScores[0] !== endRegScores[1]) {
				matchup.status = "FINAL";
				matchup.gameSecondsRemaining = "0";
				matchup.gameTime = "FINAL";

				// optional: also zero out the computed seconds remaining variable if you use it later
				matchupSecondsRemaining = 0;

				// clear any possession/redzone/downDistance UI flags on both teams
				matchup.team.forEach(t => {
					t.inRedZone = "false";
					t.hasPossession = "false";
					t.downDistance = "false";
				});
			}


			if (matchup.status === "INPROG") {
				matchup.gameSecondsRemaining = String(matchupSecondsRemaining ?? 0);

				if (matchup.scoreChange) {
					// build a matchup-level "drive key" using both teams' live stats
					const t0 = ls_tstats?.[matchup.team?.[0]?.id] ?? null;
					const t1 = ls_tstats?.[matchup.team?.[1]?.id] ?? null;

					const k0 = getDriveKey(t0);
					const k1 = getDriveKey(t1);
					const curDriveKey = `${k0}||${k1}`;

					if (matchup._driveKeyAtScoreChange == null) {
						// first pass after scoreChange was set: snapshot
						matchup._driveKeyAtScoreChange = curDriveKey;
					} else if (curDriveKey !== matchup._driveKeyAtScoreChange) {
						// drive state moved -> clear the UI suppression
						matchup.scoreChange = false;
						matchup.scoreChangeClock = null;
						matchup._driveKeyAtScoreChange = null;
					}
				} else {
					// keep this clean when not in scoreChange
					matchup._driveKeyAtScoreChange = null;
				}
			}


		}
		if (matchup.status === "FINAL") {
			const finalLabel = matchup.overtime ? "Final/OT" : "Final";
			matchup.scoreChange = false;
			matchup.scoreChangeClock = null;
			matchup._driveKeyAtScoreChange = null;
			const generateFinalTeamContent = (team1, team2) => {
				const atSymbol1 = team1.isHome === "1" ? "" : `<div style="padding-right:.1rem">at</div>`;
				const atSymbol2 = team2.isHome === "1" ? "" : `<div style="padding-right:.1rem">at</div>`;

				const team1Content = `
		${atSymbol1}
		<div style="padding-right:.1rem">${team2.id}</div>
		<div class="${team2.id}" style="padding-right:.3rem">${team2.score}</div>
		<div style="padding-right:.1rem">${team1.id}</div>
		<div class="${team1.id}" style="padding-right:.2rem">${team1.score}</div>
		<div class="gameIsFinal">${finalLabel}</div>
	`;

				const team2Content = `
		${atSymbol2}
		<div style="padding-right:.1rem">${team1.id}</div>
		<div class="${team1.id}" style="padding-right:.3rem">${team1.score}</div>
		<div style="padding-right:.1rem">${team2.id}</div>
		<div class="${team2.id}" style="padding-right:.2rem">${team2.score}</div>
		<div class="gameIsFinal">${finalLabel}</div>
	`;

				return [team1Content, team2Content];
			};

			const [team1FinalContent, team2FinalContent] = generateFinalTeamContent(matchup.team[0], matchup.team[1]);
			matchupContent[matchup.team[0].id] = team1FinalContent;
			matchupContent[matchup.team[1].id] = team2FinalContent;
		}
		if (matchup.status === "SCHED") {

			matchup.scoreChange = false;
			matchup.scoreChangeClock = null;
			matchup._driveKeyAtScoreChange = null;

			const generateScheduledTeamContent = (team1, team2) => {
				const team1Content = `<div style="padding-right:.1rem">${team1.id}</div><div style="padding-right:.1rem">${team1.isHome === "1" ? "vs" : "at"}</div><div>${team2.id}</div><div class="matchupTime">${matchup.gameTime}</div>`;
				const team2Content = `<div style="padding-right:.1rem">${team2.id}</div><div style="padding-right:.1rem">${team2.isHome === "1" ? "vs" : "at"}</div><div>${team1.id}</div><div class="matchupTime">${matchup.gameTime}</div>`;
				return [team1Content, team2Content];
			};
			const [team1ScheduledContent, team2ScheduledContent] = generateScheduledTeamContent(matchup.team[0], matchup.team[1]);
			matchupContent[matchup.team[0].id] = team1ScheduledContent;
			matchupContent[matchup.team[1].id] = team2ScheduledContent;
		}
		if (matchup.status === "INPROG") {
			if (matchup.team[0].score === '') matchup.team[0].score = '0';
			if (matchup.team[1].score === '') matchup.team[1].score = '0';
			let team1IsPossessing = matchup.team[0].hasPossession === "true";
			let team2IsPossessing = matchup.team[1].hasPossession === "true";
			let team1inRedZone = matchup.team[0].inRedZone === "true"
			let team2inRedZone = matchup.team[1].inRedZone === "true";
			let team1downDistance = matchup.team[0].downDistance === "true";
			let team2downDistance = matchup.team[1].downDistance === "true";
			const generateCurrentTeamContent = (team1, team2) => {
				const atSymbol1 = team1.isHome === "1" ? "" : `<div style="padding-right:.1rem">at</div>`;
				const atSymbol2 = team2.isHome === "1" ? "" : `<div style="padding-right:.1rem">at</div>`;

				const team1Parts = [`
		${atSymbol1}
		<div style="padding-right:.1rem">${team2.id}</div>
		<div class="${team2.id}" style="padding-right:.3rem">${team2.score}</div>
		<div style="padding-right:.1rem">${team1.id}</div>
		<div class="${team1.id}" style="padding-right:.2rem">${team1.score}</div>
	`];

				const team2Parts = [`
		${atSymbol2}
		<div style="padding-right:.1rem">${team1.id}</div>
		<div class="${team1.id}" style="padding-right:.3rem">${team1.score}</div>
		<div style="padding-right:.1rem">${team2.id}</div>
		<div class="${team2.id}" style="padding-right:.2rem">${team2.score}</div>
	`];

				const suppressDriveIcons = matchup.scoreChange === true;

				if (!suppressDriveIcons) {
					if (team1IsPossessing && team1downDistance && team1inRedZone) {
						team1Parts.push(`<div class="in-redzone"><img src="//www.mflscripts.com/ImageDirectory/script-images/goal-post.svg" alt="redzone" title="redzone" style="height:1em;margin-left:.1rem;"></div>`);
					} else if (team1IsPossessing && team1downDistance) {
						team1Parts.push(`<div class="on-offense"><img src="//www.mflscripts.com/ImageDirectory/script-images/football.svg" alt="has ball" title="has ball" style="height:1em;margin-left:.1rem;"></div>`);
					}

					if (team2IsPossessing && team2downDistance && team2inRedZone) {
						team2Parts.push(`<div class="in-redzone"><img src="//www.mflscripts.com/ImageDirectory/script-images/goal-post.svg" alt="redzone" title="redzone" style="height:1em;margin-left:.1rem;"></div>`);
					} else if (team2IsPossessing && team2downDistance) {
						team2Parts.push(`<div class="on-offense"><img src="//www.mflscripts.com/ImageDirectory/script-images/football.svg" alt="has ball" title="has ball" style="height:1em;margin-left:.1rem;"></div>`);
					}
				}


				return [team1Parts.join(""), team2Parts.join("")];
			};

			const [team1CurrentContent, team2CurrentContent] = generateCurrentTeamContent(matchup.team[0], matchup.team[1]);
			matchupContent[matchup.team[0].id] = team1CurrentContent;
			matchupContent[matchup.team[1].id] = team2CurrentContent;
			const team1Game = `${matchup.team[0].Remaining}${matchup.team[0].Quarter}`;
			const team2Game = `${matchup.team[1].Remaining}${matchup.team[1].Quarter}`;
			matchupGame[matchup.team[0].id] = team1Game;
			matchupGame[matchup.team[1].id] = team2Game;
		}
	});
	if (LSMcurrentWeek) {
		const sortingOrder = {
			INPROG: 1,
			SCHED: 2,
			FINAL: 3
		};

		lsmNFLmatchups.sort((a, b) => {
			const orderA = sortingOrder[a.status];
			const orderB = sortingOrder[b.status];
			if (orderA !== orderB) return orderA - orderB;

			if (a.status === "INPROG") {
				const aSecs = Number.parseInt(a.gameSecondsRemaining, 10) || 0;
				const bSecs = Number.parseInt(b.gameSecondsRemaining, 10) || 0;

				const aIsHalf = (aSecs === 1800);
				const bIsHalf = (bSecs === 1800);

				if (aIsHalf !== bIsHalf) return aIsHalf ? 1 : -1;
				return aSecs - bSecs; // least â†’ most time left
			}

			return Number.parseInt(a.kickoff, 10) - Number.parseInt(b.kickoff, 10);
		});
	}
	// Build a quick lookup from NFL team id -> matchup.status so we don't
	// scan lsmNFLmatchups for every fantasy player.
	const teamStatusById = {};
	const teamSecondsById = {};

	for (const matchup of lsmNFLmatchups) {
		const status = matchup.status || "SCHED";

		// Convert once, and default safely
		let matchupSecs = parseInt(matchup.gameSecondsRemaining, 10);
		if (!Number.isFinite(matchupSecs)) matchupSecs = 0;

		// If you want "SCHED" teams to behave like 3600 (your earlier logic), force it:
		if (status === "SCHED") matchupSecs = 3600;
		if (status === "FINAL") matchupSecs = 0;

		if (Array.isArray(matchup.team)) {
			for (const team of matchup.team) {
				const id = team.id;
				teamStatusById[id] = status;
				teamSecondsById[id] = matchupSecs; // âœ… team clock comes from the matchup/game clock
			}
		}
	}

	if (real_ls_week > endWeek || startWeek > real_ls_week) return;

	let playerScoresMap = LSMplayerScoresByWeek[real_ls_week];

	if (!playerScoresMap) {
		playerScoresMap = {};

		const property = 'w_' + real_ls_week;
		const wrapper = reportProjectedScores_ar && reportProjectedScores_ar[property];
		const projected = wrapper && wrapper.projectedScores;
		const playerScores = projected && projected.playerScore;

		if (Array.isArray(playerScores)) {
			for (const playerScoreObject of playerScores) {
				const playerID = playerScoreObject.id;
				const playerScore = playerScoreObject.score;
				playerScoresMap[playerID] = playerScore;
			}
		} else if (playerScores && typeof playerScores === 'object') {
			for (const playerId in playerScores) {
				if (Object.prototype.hasOwnProperty.call(playerScores, playerId)) {
					const playerScoreObject = playerScores[playerId];
					const playerID = playerScoreObject.id;
					const playerScore = playerScoreObject.score;
					playerScoresMap[playerID] = playerScore;
				}
			}
			// if object but empty, that's fine â€“ just leaves map empty
		}

		// cache even if it's empty, so we don't keep re-checking
		LSMplayerScoresByWeek[real_ls_week] = playerScoresMap;
	}

	let allMatchupsFinal = lsmNFLmatchups.every(nflMatchup => nflMatchup.status === 'FINAL');

	if (LSMLiveScoring?.matchup) {
		totalMatchups = LSMLiveScoring.matchup.length;
		for (const matchup of LSMLiveScoring.matchup) {
			const franchiseScores = matchup.franchise.map(franchise => ({
				franchiseId: franchise.id,
				score: Number(franchise.score)
			}));
			let highestScore = -Infinity;
			let lowestScore = Infinity;
			for (const franchiseScore of franchiseScores) {
				if (franchiseScore.score > highestScore) {
					highestScore = franchiseScore.score;
				}
				if (franchiseScore.score < lowestScore) {
					lowestScore = franchiseScore.score;
				}
			}
			for (const franchise of matchup.franchise) {
				if (Number(franchise.score) === highestScore) {
					franchise.result = "win";
				} else if (Number(franchise.score) === lowestScore) {
					franchise.result = "loss";
				} else {
					franchise.result = "tie";
				}
				let starterPlayerCount = 0;
				let allNonstartersDone = true;
				const franchiseID = franchise.id;
				let franProj = 0;
				let franPace = 0;
				let franProjbench = 0;
				let franPacebench = 0;
				let benchTotal = 0;
				let starterSecondsRemaining = 0;
				let startersPlaying = 0;
				let startersYetToPlay = 0;
				franchise.starterProjTot = (0).toFixed(precision);
				franchise.starterPaceTot = (0).toFixed(precision);
				franchise.benchTotProj = (0).toFixed(precision);
				franchise.benchPaceTot = (0).toFixed(precision);
				franchise.benchTot = (0).toFixed(precision);
				const playerList = franchise.players.player; // always an array (maybe empty)
				for (const playerObject of playerList) {
					const playerID = playerObject.id;
					const formattedplayerID = `pid_${playerID}`;
					const playerInfo = (playerDatabase && playerDatabase[formattedplayerID]) ? playerDatabase[formattedplayerID] : null;
					const team = (playerInfo && playerInfo.team) ? playerInfo.team : "FA";
					const pos = (playerInfo && playerInfo.position) ? playerInfo.position : "FA";
					playerObject.team = team;
					playerObject.position = pos;
					const score = parseFloat(playerObject.score) || 0;
					const status = playerObject.status;

					const teamId = playerObject.team;
					const teamStatus = teamStatusById[teamId];

					// âœ… TEAM-ONLY seconds remaining (never use player feed)
					let gsr = teamSecondsById[teamId];

					// If team not found (BYE / FA / bad team code), treat as 0
					if (!Number.isFinite(gsr)) gsr = 0;

					// Store it back onto the player so the rest of your code can read it consistently
					playerObject.gameSecondsRemaining = String(gsr);

					if (status === "starter") {
						starterSecondsRemaining += gsr;
						if (teamStatus === "INPROG") {
							startersPlaying++;
						} else if (teamStatus === "SCHED") {
							startersYetToPlay++;
						}
					}

					if (teamStatus === "INPROG") {
						playerObject.playerStatus = "playing";
					} else if (teamStatus === "SCHED") {
						playerObject.playerStatus = "waiting";
					} else if (teamStatus === "FINAL") {
						playerObject.playerStatus = "done";
					} else {
						// No matching NFL game (bye / no stats)
						playerObject.playerStatus = "done bye";
					}
					if (status === "nonstarter" && !playerObject.playerStatus?.startsWith("done")) {
						allNonstartersDone = false;
					}
					if (status === "starter" && playerObject.playerStatus?.startsWith("done")) {
						starterPlayerCount++;
					}
					if (hasOwn(playerScoresMap, playerID)) {
						playerObject.orig_proj = playerScoresMap[playerID];
					} else {
						playerObject.orig_proj = "0";
					}
					const proj = parseFloat(playerObject.orig_proj) || 0;
					playerObject.pace = (score + (gsr / 3600) * proj).toFixed(precision);
					const pace = parseFloat(playerObject.pace);
					const playerPosition = (playerInfo && playerInfo.position) ? playerInfo.position : "Unknown";
					const positionIndex = LSPositionOrderIndex[playerPosition];
					playerObject.positionOrder = (positionIndex !== undefined) ?
						positionIndex :
						LSPositionOrder.length;
					if (status === 'starter') {
						const starterProjTot = proj;
						franProj += starterProjTot;
						const starterPaceTot = pace;
						franPace += starterPaceTot;
					} else if (status === 'nonstarter') {
						const benchProjTot = proj;
						franProjbench += benchProjTot;
						const benchPaceTot = pace;
						franPacebench += benchPaceTot;
						const benchTot = score;
						benchTotal += benchTot;
					}
				}
				if (LSMcurrentWeek && lsmPMR && lsm_anyHiddenStarters) {
					const fid = String(franchise.id || "");
					const hidden = Number(ls_rosters?.[fid]?.H);
					if (Number.isFinite(hidden) && hidden > 0) {
						startersYetToPlay += hidden;
						starterSecondsRemaining += (3600 * hidden);
					} else {

					}
				}


				if (LSMcurrentWeek && lsmPMR && lsm_anyHiddenStarters) {
					const fid = String(franchise.id || "");
					const hidden = Number(ls_rosters?.[fid]?.H);

					// ---- CASE 1: hidden starters ----
					if (Number.isFinite(hidden) && hidden > 0) {
						startersYetToPlay += hidden;
						starterSecondsRemaining += (3600 * hidden);

					} else {
						// ---- CASE 2: use ls_num_starters if it exists ----
						const hasLsNumStarters = typeof window.ls_num_starters !== "undefined" && Number.isFinite(Number(window.ls_num_starters));
						if (hasLsNumStarters) {
							const totalStarters = Number(window.ls_num_starters);

							const remaining = Math.max(
								0,
								totalStarters - starterPlayerCount
							);

							startersYetToPlay += remaining;
							starterSecondsRemaining += (3600 * remaining);
						}
					}
				}
				franchise.gameSecondsRemaining = String(starterSecondsRemaining);
				franchise.playersCurrentlyPlaying = String(startersPlaying);
				franchise.playersYetToPlay = String(startersYetToPlay);
				franchise.benchTot = benchTotal.toFixed(precision);
				franchise.starterProjTot = franProj.toFixed(precision);
				franchise.starterPaceTot = franPace.toFixed(precision);
				franchise.benchTotProj = franProjbench.toFixed(precision);
				franchise.benchPaceTot = franPacebench.toFixed(precision);

				if (playerList.length > 1) {
					playerList.sort(LSMsortPlayers);
				}
				if (!playerList.length) {
					//console.warn("No players for franchise", franchiseID);
				}

				if (starterPlayerCount >= LSMminStartersBase) {
					franchise.gameStatus = 'done';
				} else if (allMatchupsFinal) {
					franchise.gameStatus = 'done';
				} else if (franchise.id === "BYE") {
					franchise.gameStatus = 'done';
				} else {
					franchise.gameStatus = 'notDone';
				}
				if (allNonstartersDone) {
					franchise.benchStatus = 'done';
				} else if (allMatchupsFinal) {
					franchise.benchStatus = 'done';
				} else if (franchise.id === "BYE" || franchise.id === "AVG") {
					franchise.benchStatus = 'done';
				} else {
					franchise.benchStatus = 'notDone';
				}
			}
			if (lsm_use_probability &&
				LSMcurrentWeek &&
				matchup.status !== "FINAL" &&
				Array.isArray(matchup.franchise) &&
				matchup.franchise.length >= 2) {

				const franchises = matchup.franchise;

				let homeFr;
				let awayFr;

				// Try to use flags first
				const homeCandidates = franchises.filter(f => f.isHome === "1");
				const awayCandidates = franchises.filter(f => f.isHome === "0");

				if (homeCandidates.length === 1 && awayCandidates.length === 1 && homeCandidates[0] !== awayCandidates[0]) {
					homeFr = homeCandidates[0];
					awayFr = awayCandidates[0];
				} else {
					// Fallback: ignore flags and just treat [0] as home, [1] as away
					homeFr = franchises[0];
					awayFr = franchises[1];
				}

				const CurPtsHome = Number(homeFr.score) || 0;
				const CurPtsAway = Number(awayFr.score) || 0;
				const ProjPtsHome = Number(homeFr.starterPaceTot) || 0;
				const ProjPtsAway = Number(awayFr.starterPaceTot) || 0;
				const TimeRemHome = Number(homeFr.gameSecondsRemaining || 0) / 60;
				const TimeRemAway = Number(awayFr.gameSecondsRemaining || 0) / 60;

				const seedKey =
					`${LSMcurrentWeek}|` +
					`${homeFr.id}|${awayFr.id}|` +
					`${CurPtsAway}|${CurPtsHome}|${TimeRemAway}|${TimeRemHome}`;

				const winProbabilities = calculateWinProbability(
					CurPtsAway, CurPtsHome,
					ProjPtsAway, ProjPtsHome,
					TimeRemAway, TimeRemHome,
					totalTime,
					seedKey
				);


				let homeProb = NaN;
				let awayProb = NaN;

				if (winProbabilities &&
					typeof winProbabilities.teamHome !== "undefined" &&
					typeof winProbabilities.teamAway !== "undefined") {

					homeFr.winProb = winProbabilities.teamHome;
					awayFr.winProb = winProbabilities.teamAway;

					homeProb = parseFloat(winProbabilities.teamHome);
					awayProb = parseFloat(winProbabilities.teamAway);
				}

				// Fallback if anything blew up â†’ 50/50
				if (!Number.isFinite(homeProb) || !Number.isFinite(awayProb)) {
					homeFr.winProb = "50%";
					awayFr.winProb = "50%";
					homeFr.winProbClass = "greaterthan";
					awayFr.winProbClass = "greaterthan";
				} else if (homeProb > awayProb) {
					homeFr.winProbClass = "greaterthan";
					awayFr.winProbClass = "lessthan";
				} else if (homeProb < awayProb) {
					homeFr.winProbClass = "lessthan";
					awayFr.winProbClass = "greaterthan";
				} else {
					homeFr.winProbClass = "greaterthan";
					awayFr.winProbClass = "greaterthan";
				}
			}
		}
		//if (LSMcurrentWeek) {
		const matchupsWithCombinedSeconds = LSMLiveScoring.matchup.map((matchup) => {
			const combinedSecondsRemaining = matchup.franchise.reduce((total, franchise) => {
				if (franchise.id !== 'BYE' && franchise.gameSecondsRemaining) {
					return total + parseInt(franchise.gameSecondsRemaining, 10);
				}
				return total;
			}, 0);
			return {
				matchup,
				combinedSecondsRemaining,
				hasBye: matchup.franchise.some(franchise => franchise.id === 'BYE'),
				hasAvg: matchup.franchise.some(franchise => franchise.id === 'AVG'),
				involvesFranchiseId: matchup.franchise.some(franchise => franchise.id === lsmComFranchise)
			};
		});
		// 1. Matchups involving franchise_id (sorted by opponent type: team, avg, bye)
		const prioritizedMatchups = matchupsWithCombinedSeconds
			.filter(item => item.involvesFranchiseId) // Filter matchups involving '0001'
			.sort((a, b) => {
				const aHasBye = a.matchup.franchise.some(franchise => franchise.id === 'BYE');
				const aHasAvg = a.matchup.franchise.some(franchise => franchise.id === 'AVG');
				const bHasBye = b.matchup.franchise.some(franchise => franchise.id === 'BYE');
				const bHasAvg = b.matchup.franchise.some(franchise => franchise.id === 'AVG');

				// Sort by type: normal team (no BYE, no AVG), then AVG, then BYE
				if (aHasBye !== bHasBye) return aHasBye ? 1 : -1;
				if (aHasAvg !== bHasAvg) return aHasAvg ? 1 : -1;

				// If both matchups have the same type (normal, avg, or bye), sort by seconds remaining
				return b.combinedSecondsRemaining - a.combinedSecondsRemaining;
			});
		// 2. Other matchups not involving franchise_id (sorted by same logic)
		const otherMatchups = matchupsWithCombinedSeconds
			.filter(item => !item.involvesFranchiseId) // Exclude matchups involving '0001'
			.sort((a, b) => {
				const aHasBye = a.matchup.franchise.some(franchise => franchise.id === 'BYE');
				const aHasAvg = a.matchup.franchise.some(franchise => franchise.id === 'AVG');
				const bHasBye = b.matchup.franchise.some(franchise => franchise.id === 'BYE');
				const bHasAvg = b.matchup.franchise.some(franchise => franchise.id === 'AVG');

				// Sort by type: normal team (no BYE, no AVG), then AVG, then BYE
				if (aHasBye !== bHasBye) return aHasBye ? 1 : -1;
				if (aHasAvg !== bHasAvg) return aHasAvg ? 1 : -1;

				// If both matchups have the same type, sort by seconds remaining
				return b.combinedSecondsRemaining - a.combinedSecondsRemaining;
			});
		// Combine the prioritized matchups and other matchups
		const sortedMatchups = [
			...prioritizedMatchups.map(item => item.matchup), // Matchups involving '0001' first
			...otherMatchups.map(item => item.matchup) // All other matchups afterward
		];
		// Update the matchups
		LSMLiveScoring.matchup = sortedMatchups;
		//}
	} else if (LSMLiveScoring?.franchise) {
		if (lsm_hideTeamsNoPlayers) {
			LSMLiveScoring.franchise = LSMLiveScoring.franchise.filter(franchise =>
				(franchise?.players?.player?.length || 0) > 0
			);
		}

		totalMatchups = LSMLiveScoring.franchise.length;
		// existing sort by score (desc)
		LSMLiveScoring.franchise.sort((a, b) => {
			const as = Number(a.score) || 0;
			const bs = Number(b.score) || 0;
			return bs - as;
		});

		// pin lsmComFranchise to the front (if present)
		const pinId = String(lsmComFranchise ?? "");
		if (pinId) {
			const idx = LSMLiveScoring.franchise.findIndex(f => String(f.id) === pinId);
			if (idx > 0) {
				const [pinned] = LSMLiveScoring.franchise.splice(idx, 1);
				LSMLiveScoring.franchise.unshift(pinned);
			}
		}
		for (const franchise of LSMLiveScoring.franchise) {
			let starterPlayerCount = 0;
			let allNonstartersDone = true;
			const franchiseID = franchise.id;
			let franProj = 0;
			let franPace = 0;
			let franProjbench = 0;
			let franPacebench = 0;
			let benchTotal = 0;
			let starterSecondsRemaining = 0;
			let startersPlaying = 0;
			let startersYetToPlay = 0;
			franchise.starterProjTot = (0).toFixed(precision);
			franchise.starterPaceTot = (0).toFixed(precision);
			franchise.benchTotProj = (0).toFixed(precision);
			franchise.benchPaceTot = (0).toFixed(precision);
			franchise.benchTot = (0).toFixed(precision);
			const playerList = franchise.players.player; // always an array (maybe empty)
			for (const playerObject of playerList) {
				const playerID = playerObject.id;
				const formattedplayerID = `pid_${playerID}`;
				const playerInfo = (playerDatabase && playerDatabase[formattedplayerID]) ? playerDatabase[formattedplayerID] : null;
				const team = (playerInfo && playerInfo.team) ? playerInfo.team : "FA";
				const pos = (playerInfo && playerInfo.position) ? playerInfo.position : "FA";
				playerObject.team = team;
				playerObject.position = pos;
				const score = parseFloat(playerObject.score) || 0;
				const status = playerObject.status;

				const teamId = playerObject.team;
				const teamStatus = teamStatusById[teamId];

				// âœ… TEAM-ONLY seconds remaining (never use player feed)
				let gsr = teamSecondsById[teamId];

				// If team not found (BYE / FA / bad team code), treat as 0
				if (!Number.isFinite(gsr)) gsr = 0;

				// Store it back onto the player so the rest of your code can read it consistently
				playerObject.gameSecondsRemaining = String(gsr);

				if (status === "starter") {
					starterSecondsRemaining += gsr;
					if (teamStatus === "INPROG") {
						startersPlaying++;
					} else if (teamStatus === "SCHED") {
						startersYetToPlay++;
					}
				}
				if (teamStatus === "INPROG") {
					playerObject.playerStatus = "playing";
				} else if (teamStatus === "SCHED") {
					playerObject.playerStatus = "waiting";
				} else if (teamStatus === "FINAL") {
					playerObject.playerStatus = "done";
				} else {
					// No matching NFL game (bye / no stats)
					playerObject.playerStatus = "done bye";
				}
				if (status === "nonstarter" && !playerObject.playerStatus?.startsWith("done")) {
					allNonstartersDone = false;
				}
				if (status === "starter" && playerObject.playerStatus?.startsWith("done")) {
					starterPlayerCount++;
				}
				if (hasOwn(playerScoresMap, playerID)) {
					playerObject.orig_proj = playerScoresMap[playerID];
				} else {
					playerObject.orig_proj = "0";
				}
				const proj = parseFloat(playerObject.orig_proj) || 0;
				playerObject.pace = (score + (gsr / 3600) * proj).toFixed(precision);
				const pace = parseFloat(playerObject.pace);
				const playerPosition = (playerInfo && playerInfo.position) ? playerInfo.position : "Unknown";
				const positionIndex = LSPositionOrderIndex[playerPosition];
				playerObject.positionOrder = (positionIndex !== undefined) ?
					positionIndex :
					LSPositionOrder.length;
				if (status === 'starter') {
					const starterProjTot = proj;
					franProj += starterProjTot;
					const starterPaceTot = pace;
					franPace += starterPaceTot;
				} else if (status === 'nonstarter') {
					const benchProjTot = proj;
					franProjbench += benchProjTot;
					const benchPaceTot = pace;
					franPacebench += benchPaceTot;
					const benchTot = score;
					benchTotal += benchTot;
				}
			}
			if (LSMcurrentWeek && lsmPMR && lsm_anyHiddenStarters) {
				const fid = String(franchise.id || "");
				const hidden = Number(ls_rosters?.[fid]?.H);

				// ---- CASE 1: hidden starters ----
				if (Number.isFinite(hidden) && hidden > 0) {
					startersYetToPlay += hidden;
					starterSecondsRemaining += (3600 * hidden);

				} else {
					// ---- CASE 2: use ls_num_starters if it exists ----
					const hasLsNumStarters = typeof window.ls_num_starters !== "undefined" && Number.isFinite(Number(window.ls_num_starters));
					if (hasLsNumStarters) {
						const totalStarters = Number(window.ls_num_starters);

						const remaining = Math.max(
							0,
							totalStarters - starterPlayerCount
						);

						startersYetToPlay += remaining;
						starterSecondsRemaining += (3600 * remaining);
					}
				}
			}
			franchise.gameSecondsRemaining = String(starterSecondsRemaining);
			franchise.playersCurrentlyPlaying = String(startersPlaying);
			franchise.playersYetToPlay = String(startersYetToPlay);
			franchise.benchTot = benchTotal.toFixed(precision);
			franchise.starterProjTot = franProj.toFixed(precision);
			franchise.starterPaceTot = franPace.toFixed(precision);
			franchise.benchTotProj = franProjbench.toFixed(precision);
			franchise.benchPaceTot = franPacebench.toFixed(precision);
			if (playerList.length > 1) {
				playerList.sort(LSMsortPlayers);
			}

			if (!playerList.length) {
				//console.warn("No players for franchise", franchiseID);
			}

			if (starterPlayerCount >= LSMminStartersBase) {
				franchise.gameStatus = 'done';
			} else if (allMatchupsFinal) {
				franchise.gameStatus = 'done';
			} else if (franchise.id === "BYE" || franchise.id === "AVG") {
				franchise.gameStatus = 'done';
			} else {
				franchise.gameStatus = 'notDone';
			}
			if (allNonstartersDone) {
				franchise.benchStatus = 'done';
			} else if (allMatchupsFinal) {
				franchise.benchStatus = 'done';
			} else if (franchise.id === "BYE" || franchise.id === "AVG") {
				franchise.benchStatus = 'done';
			} else {
				franchise.benchStatus = 'notDone';
			}
		}
	} else {
		totalMatchups = 0;
	}
}

// ===== Deterministic RNG for win probability =====
let LSM_RAND_SEED = 1;

// Seed from a string key (matchup/game state)
function lsmSeedRandomFromKey(key) {
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
	}
	if (hash === 0) hash = 1;
	LSM_RAND_SEED = hash;

	// IMPORTANT: clear any cached Gaussian spare sample
	lsmGaussianRandom._spare = undefined;
}

// Uniform [0,1)
function lsmRandom() {
	LSM_RAND_SEED = (LSM_RAND_SEED * 1664525 + 1013904223) >>> 0;
	return LSM_RAND_SEED / 4294967296;
}

// Gaussian using that RNG (Boxâ€“Muller)
function lsmGaussianRandom(mean = 0, stdev = 1) {
	let spare = lsmGaussianRandom._spare;
	if (spare !== undefined) {
		lsmGaussianRandom._spare = undefined;
		return spare * stdev + mean;
	}

	let u = 0,
		v = 0,
		s = 0;
	while (s === 0 || s >= 1) {
		u = lsmRandom() * 2 - 1;
		v = lsmRandom() * 2 - 1;
		s = u * u + v * v;
	}
	const mul = Math.sqrt(-2 * Math.log(s) / s);
	const z0 = u * mul;
	const z1 = v * mul;

	lsmGaussianRandom._spare = z1;
	return z0 * stdev + mean;
}


// Calculate Win Probabilities (Monte Carlo, deterministic)
function calculateWinProbability(
	CurPtsAway, CurPtsHome,
	ProjPtsAway, ProjPtsHome,
	TimeRemAway, TimeRemHome,
	totalTime,
	seedKey // optional
) {
	// 0) Build deterministic seed if none supplied
	if (!seedKey) {
		seedKey =
			"LSM|" +
			CurPtsAway + "|" + CurPtsHome + "|" +
			ProjPtsAway + "|" + ProjPtsHome + "|" +
			TimeRemAway + "|" + TimeRemHome + "|" +
			totalTime;
	}
	lsmSeedRandomFromKey(seedKey);

	let winProbabilityAway;
	let winProbabilityHome;

	// 1) Both sides out of time â†’ final result
	if (TimeRemAway === 0 && TimeRemHome === 0) {
		if (CurPtsAway > CurPtsHome) {
			winProbabilityAway = 1;
			winProbabilityHome = 0;
		} else if (CurPtsAway < CurPtsHome) {
			winProbabilityAway = 0;
			winProbabilityHome = 1;
		} else {
			winProbabilityAway = 0.5;
			winProbabilityHome = 0.5;
		}
	} else if (TimeRemAway === 0 && TimeRemHome > 0 && (CurPtsHome > CurPtsAway)) {
		// Away out of time and losing
		winProbabilityAway = 0;
		winProbabilityHome = 1;
	} else if (TimeRemHome === 0 && TimeRemAway > 0 && (CurPtsAway > CurPtsHome)) {
		// Home out of time and losing
		winProbabilityAway = 1;
		winProbabilityHome = 0;
	} else {
		// 2) Monte Carlo simulation using deterministic RNG
		const SIMS = 400;
		const SIGMA_SCALE = 4;

		function buildTeamParams(curPts, projPts, timeRem) {
			const fracTime = Math.max(0, Math.min(1, (timeRem || 0) / (totalTime || 1)));

			const meanFinal = projPts;
			const meanRemaining = Math.max(meanFinal - curPts, 0);

			const baseVar = Math.max(meanRemaining, 0.1);
			const varRemaining = baseVar * fracTime;
			const sdRemaining = Math.sqrt(varRemaining) * SIGMA_SCALE;

			return {
				curPts,
				meanRemaining,
				sdRemaining
			};
		}

		const away = buildTeamParams(CurPtsAway, ProjPtsAway, TimeRemAway);
		const home = buildTeamParams(CurPtsHome, ProjPtsHome, TimeRemHome);

		let wins = 0;
		let losses = 0;

		for (let i = 0; i < SIMS; i++) {
			let remA = lsmGaussianRandom(away.meanRemaining, away.sdRemaining);
			let remH = lsmGaussianRandom(home.meanRemaining, home.sdRemaining);

			if (remA < 0) remA = 0;
			if (remH < 0) remH = 0;

			const finalA = away.curPts + remA;
			const finalH = home.curPts + remH;

			if (finalA > finalH) {
				wins++;
			} else if (finalA < finalH) {
				losses++;
			}
			// ties ignored (like Sharks script)
		}

		if (wins + losses === 0) {
			winProbabilityAway = 0.5;
			winProbabilityHome = 0.5;
		} else {
			winProbabilityAway = wins / (wins + losses);
			winProbabilityHome = 1 - winProbabilityAway;
		}

		// Clamp if time remains (no 0/100 until over)
		if (TimeRemAway > 0 || TimeRemHome > 0) {
			if (winProbabilityAway > 0.99) winProbabilityAway = 0.99;
			if (winProbabilityAway < 0.01) winProbabilityAway = 0.01;
			winProbabilityHome = 1 - winProbabilityAway;
		}
	}

	// Extra safety: if anything is still off, default to 50/50
	if (!Number.isFinite(winProbabilityAway) || !Number.isFinite(winProbabilityHome)) {
		winProbabilityAway = 0.5;
		winProbabilityHome = 0.5;
	}

	return {
		teamAway: (winProbabilityAway * 100).toFixed(0) + "%",
		teamHome: (winProbabilityHome * 100).toFixed(0) + "%"
	};
}


// SORT PLAYERS //
const LSMsortPlayers = (a, b) => {

	const statusOrder = (status) => {
		// starter first, then unknown/other, then nonstarter
		if (status === "starter") return -1;
		if (status === "nonstarter") return 1;
		return 0;
	};

	const playerStatusOrder = (playerStatus) => {
		switch (playerStatus) {
			case "playing":
				return -2;
			case "waiting":
				return -1;
			case "done":
				return 1;
			case "done bye":
				return 2;
			default:
				return 3;
		}
	};

	// 1) starter vs nonstarter
	const sComp = statusOrder(a.status) - statusOrder(b.status);
	if (sComp !== 0) return sComp;

	// 2) positionOrder (asc) - guard against undefined/NaN
	const posA = Number.isFinite(a.positionOrder) ? a.positionOrder : 999;
	const posB = Number.isFinite(b.positionOrder) ? b.positionOrder : 999;
	if (posA !== posB) return posA - posB;

	// 3) playerStatus (playing/waiting/done/done bye)
	const psComp = playerStatusOrder(a.playerStatus) - playerStatusOrder(b.playerStatus);
	if (psComp !== 0) return psComp;

	// 4) score (desc) - guard against NaN
	const scoreA = Number(a.score) || 0;
	const scoreB = Number(b.score) || 0;
	if (scoreA !== scoreB) return scoreB - scoreA;

	// 5) if both scores are 0, sort by orig_proj (desc)
	if (scoreA === 0 && scoreB === 0) {
		const projA = Number(a.orig_proj) || 0;
		const projB = Number(b.orig_proj) || 0;
		if (projA !== projB) return projB - projA;
	}

	// 6) final deterministic tie-breaker (prevents "random" ordering)
	// Use id if present; otherwise keep stable
	const idA = String(a.id ?? "");
	const idB = String(b.id ?? "");
	if (idA && idB && idA !== idB) return idA.localeCompare(idB);

	return 0;
};

function applyAVGFranchiseScore(LSMLiveScoring, franchiseDatabase, precision, format_points) {
	if (!LSMLiveScoring || !Array.isArray(LSMLiveScoring.matchup)) return;

	// --- 1) Decide which franchises count (franchiseDatabase minus commissioner) ---
	const countingIds = [];
	for (const key in franchiseDatabase) {
		const fr = franchiseDatabase[key];
		if (!fr || !fr.id) continue;

		// commissioner never counts
		if (fr.id === "0000") continue;

		// defensive: skip special ids if they ever appear in DB
		if (fr.id === "BYE" || fr.id === "AVG") continue;

		countingIds.push(fr.id);
	}
	const denom = countingIds.length || 1;

	// --- 2) Build unique score map from LSMLiveScoring.matchup franchises (count each id once) ---
	const scoreById = Object.create(null);

	for (const matchup of LSMLiveScoring.matchup) {
		if (!matchup || !matchup.franchise) continue;

		const frArr = Array.isArray(matchup.franchise) ? matchup.franchise : [matchup.franchise];
		for (const fr of frArr) {
			const id = fr?.id;
			if (!id) continue;

			// never use these in the average
			if (id === "0000" || id === "BYE" || id === "AVG") continue;

			// only count franchises that exist in franchiseDatabase (prevents random IDs)
			if (!countingIds.includes(id)) continue;

			// only take the first occurrence of each franchise id
			if (scoreById[id] !== undefined) continue;

			const n = Number(fr.score);
			scoreById[id] = Number.isFinite(n) ? n : 0;
		}
	}

	// --- 3) Sum across ALL counting franchises exactly once (missing => 0) ---
	let sum = 0;
	for (const id of countingIds) {
		sum += Number(scoreById[id] ?? 0);
	}

	const avg = sum / denom;

	// Format the AVG score the same way you format franchise.score elsewhere
	const avgFormatted = (typeof format_points === "function") ?
		format_points(avg) :
		avg.toFixed(precision);

	// --- 4) Apply AVG score into every franchise object with id === "AVG" ---
	for (const matchup of LSMLiveScoring.matchup) {
		if (!matchup || !matchup.franchise) continue;

		const frArr = Array.isArray(matchup.franchise) ? matchup.franchise : [matchup.franchise];
		for (const fr of frArr) {
			if (fr?.id === "AVG") {
				fr.score = avgFormatted;

				// optional: keep these consistent if your UI expects them
				if (fr.adj_score != null) {
					// If AVG has adjustments in your league, keep them, otherwise you can omit this.
					const adj = Number(fr.adj_score);
					const adjSafe = Number.isFinite(adj) ? adj : 0;
					fr.adj_score = adjSafe.toFixed(precision);

					const ps = Number(fr.score);
					fr.Playersscore = (Number.isFinite(ps) ? (ps - adjSafe) : (0 - adjSafe)).toFixed(precision);
				}
			}
		}
	}
}

function hasAVGMatchup(LSMLiveScoring) {
	const matchups = LSMLiveScoring?.matchup;
	if (!Array.isArray(matchups) || !matchups.length) return false;

	for (const mu of matchups) {
		const frArr = Array.isArray(mu?.franchise) ? mu.franchise : (mu?.franchise ? [mu.franchise] : []);
		for (const fr of frArr) {
			if (fr?.id === "AVG") return true;
		}
	}
	return false;
}

const playerMetaByPid = Object.create(null);

function hydratePlayerAlways(p) {
	if (!p || !p.id) return;

	if (p.team && p.position) return;

	const pid = String(p.id);

	if (!playerMetaByPid[pid]) {
		const rec = playerDatabase?.[`pid_${pid}`] || null;
		playerMetaByPid[pid] = {
			team: rec?.team || "FA",
			position: rec?.position || null
		};
	}

	const meta = playerMetaByPid[pid];
	p.team = p.team || meta.team;
	p.position = p.position || meta.position;
}

// GET LIVE SCORING DETAILS - run on initial load , select different weeks and refresh //
async function getLSMLiveScoring() {
	if (real_ls_week > endWeek || startWeek > real_ls_week) {
		LSMLiveScoring = [];
		return;
	}

	const randomValue = Math.floor(Math.random() * 1000) + 1;

	const pointsByPid = Object.create(null); // pid -> computed points once
	const franchiseScoreByFid = Object.create(null); // fid -> computed starter score once (apply to all copies)
	const adjByFid = Object.create(null); // fid -> computed adj_score/Playersscore once (apply to all copies)

	function safeClone(x) {
		if (typeof structuredClone === "function") return structuredClone(x);
		return JSON.parse(JSON.stringify(x));
	}

	function asArray(x) {
		if (x == null) return [];
		return Array.isArray(x) ? x : [x];
	}

	function toNum(x, fallback = 0) {
		const n = Number(x);
		return Number.isFinite(n) ? n : fallback;
	}

	function formatFixed(x, prec) {
		return toNum(x, 0).toFixed(prec);
	}

	// IMPORTANT:
	// Hydrate MUST run on EVERY player object copy because your HTML may read any hydrated field.
	function hydratePlayerAlways(p) {
		try {
			lsmHydrateLivePlayer(p);
		} catch (_) {}
	}

	// Points can be cached by pid (NFL-derived), but p.score must be assigned on EVERY player object.
	function getPointsOnceByPid(p) {
		const pid = p?.id;
		if (!pid) return "0";

		if (pointsByPid[pid] !== undefined) return pointsByPid[pid];

		let val = "0";
		try {
			val = update_player_points(pid, p) ?? "0";
		} catch (_) {
			val = "0";
		}

		pointsByPid[pid] = val;
		return val;
	}

	// -----------------------------------------------------
	// NORMALIZATION
	// IMPORTANT: same fid can appear as MULTIPLE distinct objects
	// (multiple matchups). Therefore:
	//   - cleanup MUST run on EVERY franchise object (no early return)
	// -----------------------------------------------------
	function normalizeFranchisePlayers(franchise) {
		let playerSrc = null;

		if (franchise?.players && franchise.players.player !== undefined) {
			playerSrc = franchise.players.player;
		} else if (franchise && hasOwn(franchise, "player")) {
			playerSrc = franchise.player;
		}

		if (playerSrc != null) {
			const playerArray = asArray(playerSrc);

			for (const player of playerArray) {
				if (!player) continue;
				if (player.score === undefined) player.score = (0).toFixed(precision);
				if (player.gameSecondsRemaining === undefined) player.gameSecondsRemaining = "0";
				if (player.updatedStats === undefined) player.updatedStats = "";
			}

			// normalize to array wrapper
			franchise.players = {
				player: playerArray
			};
		} else {
			// guarantee wrapper exists and is empty array
			if (!franchise.players || typeof franchise.players !== "object") franchise.players = {};
			if (!Array.isArray(franchise.players.player)) franchise.players.player = [];
		}

		if (franchise && hasOwn(franchise, "player")) delete franchise.player;
	}

	function normalizeFranchise(franchise) {
		if (!franchise) return;

		// MUST run for every franchise object (even if same fid appears multiple times)
		if (franchise.gameSecondsRemaining === undefined) franchise.gameSecondsRemaining = "0";
		if (franchise.playersCurrentlyPlaying === undefined) franchise.playersCurrentlyPlaying = "0";
		if (franchise.playersYetToPlay === undefined) franchise.playersYetToPlay = "0";

		// score normalization (safe even if later overwritten)
		franchise.score = formatFixed(franchise.score, precision);

		normalizeFranchisePlayers(franchise);

		// adj_score / Playersscore normalize (only if present)
		if (franchise.adj_score) {
			franchise.adj_score = formatFixed(franchise.adj_score, precision);
			franchise.Playersscore = (toNum(franchise.score) - toNum(franchise.adj_score)).toFixed(precision);
		}
	}

	function normalizeAllFranchises(lsObj) {
		if (lsObj?.matchup) {
			for (const matchup of asArray(lsObj.matchup)) {
				for (const fr of asArray(matchup?.franchise)) normalizeFranchise(fr);
			}
		}
		if (lsObj?.franchise) {
			for (const fr of asArray(lsObj.franchise)) normalizeFranchise(fr);
		}
	}

	// -----------------------------------------------------
	// BYE logic (unchanged)
	// -----------------------------------------------------
	function applyByeLogicToLSM(lsObj) {
		if (!lsObj) return;

		if (lsm_byeMatchups) {
			if (lsObj?.matchup && lsObj?.franchise) {
				const originalMatchups = lsObj.matchup.slice();
				const franchises = lsObj.franchise;

				const newMatchups = asArray(franchises).map(franchise => ({
					franchise: [franchise, {
						id: "BYE"
					}]
				}));

				lsObj.matchup = originalMatchups.concat(newMatchups);
				delete lsObj.franchise;
			}
		} else {
			if (lsObj?.matchup && lsObj?.franchise) delete lsObj.franchise;

			if (lsObj?.matchup) {
				lsObj.matchup = asArray(lsObj.matchup).filter(matchup => {
					const frArr = asArray(matchup?.franchise);
					const hasBye = frArr.some(fr => fr && fr.id === "BYE");
					return !hasBye;
				});
			}
		}
	}

	function captureByeMatchupsFrom(lsObj) {
		if (!lsm_byeMatchups || !lsObj?.matchup) return [];
		return asArray(lsObj.matchup).filter(matchup => {
			const frArr = asArray(matchup?.franchise);
			return frArr.some(fr => fr && fr.id === "BYE");
		});
	}

	function buildLiveFrById(lsObj) {
		const liveFrById = Object.create(null);

		if (lsObj?.matchup) {
			for (const mu of asArray(lsObj.matchup)) {
				for (const fr of asArray(mu?.franchise)) {
					if (fr && fr.id) liveFrById[fr.id] = fr;
				}
			}
		}

		if (lsObj?.franchise) {
			for (const fr of asArray(lsObj.franchise)) {
				if (fr && fr.id) liveFrById[fr.id] = fr;
			}
		}

		return liveFrById;
	}

	function mergeWeeklyScheduleWithLive(weekNum, lsObj) {
		try {
			const property = "w_" + weekNum;
			const src = reportWeeklyResults_ar?.[property];
			if (!(src && src.weeklyResults && src.weeklyResults.matchup)) return;

			const weekly = safeClone(src.weeklyResults);

			// Start from schedule matchups
			let weeklyMatchups = asArray(weekly.matchup);

			// âœ… If BYEs are disabled, remove ALL schedule-defined BYE matchups right here
			if (!lsm_byeMatchups) {
				weeklyMatchups = weeklyMatchups.filter(mu => {
					const frArr = asArray(mu?.franchise);
					return !frArr.some(fr => fr && fr.id === "BYE");
				});
			}

			// Build a set of franchise ids that ALREADY have a BYE matchup in weeklyResults
			// (only needed when BYEs are enabled)
			const weeklyByeFids = new Set();
			if (lsm_byeMatchups) {
				for (const mu of weeklyMatchups) {
					const frArr = asArray(mu?.franchise);
					const hasBye = frArr.some(fr => fr && fr.id === "BYE");
					if (!hasBye) continue;

					for (const fr of frArr) {
						const id = fr?.id;
						if (id && id !== "BYE") weeklyByeFids.add(String(id));
					}
				}
			}

			// Capture BYE matchups currently in live (these may be forced from applyByeLogicToLSM)
			// âœ… If BYEs are disabled, don't capture/append any
			let byeMatchupsFromLive = lsm_byeMatchups ? captureByeMatchupsFrom(lsObj) : [];

			// Keep only BYE matchups for franchises that DO NOT already have a schedule-defined BYE
			if (lsm_byeMatchups && byeMatchupsFromLive.length && weeklyByeFids.size) {
				byeMatchupsFromLive = byeMatchupsFromLive.filter(mu => {
					const frArr = asArray(mu?.franchise);
					const real = frArr.find(fr => fr && fr.id && fr.id !== "BYE");
					const fid = real?.id ? String(real.id) : "";
					if (!fid) return true;
					return !weeklyByeFids.has(fid);
				});
			}

			const liveFrById = buildLiveFrById(lsObj);

			let mergedMatchups = weeklyMatchups.map(mu => {
				const baseFrArr = asArray(mu?.franchise);
				if (!baseFrArr.length) return mu;

				const mergedFrArr = baseFrArr.map(baseFr => {
					if (!baseFr || !baseFr.id) return baseFr;

					const liveFr = liveFrById[baseFr.id];
					if (!liveFr) return baseFr;

					const merged = Object.assign({}, baseFr, liveFr);
					if (typeof baseFr.isHome !== "undefined") merged.isHome = baseFr.isHome;

					return merged;
				});

				return {
					...mu,
					franchise: mergedFrArr
				};
			});

			// Append only the missing forced BYEs (only when enabled)
			if (lsm_byeMatchups && byeMatchupsFromLive.length) {
				mergedMatchups = mergedMatchups.concat(byeMatchupsFromLive);
			}

			lsObj.matchup = mergedMatchups;

			// Keep current behavior
			delete lsObj.franchise;
		} catch (mergeErr) {
			console.warn("[LSM] Failed to merge weeklyResults + liveScoring", mergeErr);
		}
	}


	// -----------------------------------------------------
	// SCORING (current week)
	// IMPORTANT: franchise can appear multiple times as distinct objects.
	// We compute once per fid, APPLY to all copies.
	// Player copies across teams are allowed:
	//   - we cache points by pid (NFL-derived)
	//   - we still hydrate + set p.score on EACH player object copy
	// -----------------------------------------------------
	function computeAndCacheAdjForFid(fid, franchise) {
		// If no adj_score on this object, don't create cache entry.
		// (If you want adj always, switch to checking ls_adjust[fid] instead.)
		if (!franchise || !franchise.adj_score) return;

		if (adjByFid[fid] !== undefined) {
			const cached = adjByFid[fid];
			franchise.adj_score = cached.adj_score;
			franchise.Playersscore = cached.Playersscore;
			return;
		}

		const matchingAdjustment = window.ls_adjust?.[fid];
		const adj = Number(matchingAdjustment?.value);
		const adjStr = Number.isFinite(adj) ? adj.toFixed(precision) : (0).toFixed(precision);

		const fs = Number(franchise.score);
		const fa = Number(adjStr);
		const playersScoreStr = (
			(Number.isFinite(fs) ? fs : 0) - (Number.isFinite(fa) ? fa : 0)
		).toFixed(precision);

		adjByFid[fid] = {
			adj_score: adjStr,
			Playersscore: playersScoreStr
		};

		franchise.adj_score = adjStr;
		franchise.Playersscore = playersScoreStr;
	}

	function scoreAllFranchisesCurrentWeek(lsObj) {
		function scoreOneFranchiseObject(franchise) {
			const fid = franchise?.id;
			if (!fid) return;

			// Ensure structure is normalized for this object
			normalizeFranchisePlayers(franchise);

			const playerList = asArray(franchise?.players?.player);

			// Always hydrate + set p.score on EACH player object copy (HTML may read any fields)
			for (const p of playerList) {
				if (!p) continue;
				hydratePlayerAlways(p);
				p.score = getPointsOnceByPid(p);
			}

			// Compute starter total once per fid, apply to all copies
			if (franchiseScoreByFid[fid] !== undefined) {
				franchise.score = franchiseScoreByFid[fid];
				computeAndCacheAdjForFid(fid, franchise);
				return;
			}

			let starterTotalScore = 0;

			for (const p of playerList) {
				if (p?.status === "starter") {
					const s = Number(p.score);
					starterTotalScore += Number.isFinite(s) ? s : 0;
				}
			}

			const scoreStr = format_points(starterTotalScore);
			franchiseScoreByFid[fid] = scoreStr;
			franchise.score = scoreStr;

			// Apply/calc adj
			computeAndCacheAdjForFid(fid, franchise);
		}

		if (lsObj?.matchup) {
			for (const matchup of asArray(lsObj.matchup)) {
				for (const franchise of asArray(matchup?.franchise)) {
					scoreOneFranchiseObject(franchise);
				}
			}
		}

		if (lsObj?.franchise) {
			for (const franchise of asArray(lsObj.franchise)) {
				scoreOneFranchiseObject(franchise);
			}
		}
	}

	function normalizeNonCurrentWeekScores(lsObj, weekNum) {

		// Only used for FUTURE weeks: fid -> adj_score from weeklyResults
		let adjByFid = null;

		if (LSMfutureWeek) {
			adjByFid = Object.create(null);

			const wk = Number(weekNum);
			const weekly = reportWeeklyResults_ar?.["w_" + wk]?.weeklyResults;

			if (weekly) {
				const addFr = (fr) => {
					const fid = String(fr?.id ?? "");
					if (!fid || fid === "BYE" || fid === "AVG") return;

					// store even if it's "0" / "0.00" â€” that's still a real value
					if (fr && fr.adj_score != null && fr.adj_score !== "") {
						adjByFid[fid] = fr.adj_score;
					}
				};

				for (const fr of asArray(weekly.franchise)) addFr(fr);
				for (const mu of asArray(weekly.matchup)) {
					for (const fr of asArray(mu?.franchise)) addFr(fr);
				}
			}
		}

		function normalizeOne(franchise) {
			if (!franchise) return;

			// normalize total score
			franchise.score = formatFixed(franchise.score, precision);

			// FUTURE week: force adj_score from weeklyResults map when available
			if (LSMfutureWeek && adjByFid) {
				const fid = String(franchise.id ?? "");
				if (fid && adjByFid[fid] != null) {
					franchise.adj_score = adjByFid[fid]; // overwrite with authoritative value
				}
			}

			// If adj_score exists now, normalize it; otherwise fall back like your original UI expectations
  			if (franchise.adj_score != null && franchise.adj_score !== "") {
    				franchise.adj_score = formatFixed(franchise.adj_score, precision);
    				franchise.Playersscore = (toNum(franchise.score) - toNum(franchise.adj_score)).toFixed(precision);
  			} else {
    				// Non-future weeks: do NOT fabricate adj_score
    				if (hasOwn(franchise, "adj_score")) delete franchise.adj_score;
    				if (hasOwn(franchise, "Playersscore")) delete franchise.Playersscore;
  			}
		}

		if (lsObj?.matchup) {
			for (const matchup of asArray(lsObj.matchup)) {
				for (const franchise of asArray(matchup?.franchise)) normalizeOne(franchise);
			}
		}
		if (lsObj?.franchise) {
			for (const franchise of asArray(lsObj.franchise)) normalizeOne(franchise);
		}
	}

	// helper: decide if weeklyResults has real franchise scores yet
	function weeklyResultsHasScores(weekly) {
		// Check BOTH weekly.franchise and weekly.matchup[].franchise (some leagues only populate one)
		const candidates = [];

		if (weekly?.franchise) {
			const frArr = Array.isArray(weekly.franchise) ? weekly.franchise : [weekly.franchise];
			candidates.push(...frArr);
		}

		if (weekly?.matchup) {
			const muArr = Array.isArray(weekly.matchup) ? weekly.matchup : [weekly.matchup];
			for (const mu of muArr) {
				const frArr = mu?.franchise ?
					(Array.isArray(mu.franchise) ? mu.franchise : [mu.franchise]) : [];
				candidates.push(...frArr);
			}
		}

		// Consider it "ready" if ANY real franchise has score > 0
		for (const fr of candidates) {
			const id = fr?.id;
			if (!id || id === "BYE" || id === "AVG" || id === "0000") continue;
			const s = Number(fr?.score);
			if (Number.isFinite(s) && s > 0) return true;
		}

		return false;
	}

	try {
		if (LSMpreviousWeek) {
			const property = "w_" + real_ls_week;
			const src = reportWeeklyResults_ar?.[property];

			let usedFallbackCache = false;

			const canUseCache = (real_ls_week === liveScoringWeek && !!liveScoringLiveWeek);

			// Only compute when it can affect fallback behavior
			const allFinalForRealWeek = canUseCache ?
				allGamesFinalFromLiveFeed(real_ls_week) :
				true;

			if (src?.weeklyResults) {

				const weekly = safeClone(src.weeklyResults);
				LSMLiveScoring = {};

				if (weekly?.matchup) LSMLiveScoring.matchup = asArray(weekly.matchup);
				if (weekly?.franchise) LSMLiveScoring.franchise = asArray(weekly.franchise);

				// --- Special case: weeklyResults exists but week isn't FINAL yet
				// Fallback ONLY for the one week where cache matches.
				if (canUseCache && !allFinalForRealWeek) {

					const data = safeClone(liveScoringLiveWeek);
					const ls = data?.liveScoring;

					LSMLiveScoring = {};

					if (ls && hasOwn(ls, "matchup")) {
						const mu = ls.matchup;
						LSMLiveScoring.matchup = hasOwn(mu, "franchise") ? [mu] : asArray(mu);
					}

					if (ls && hasOwn(ls, "franchise")) {
						const fr = ls.franchise;
						LSMLiveScoring.franchise = hasOwn(fr, "id") ? [fr] : asArray(fr);
					}

					usedFallbackCache = true;
				}

			} else if (canUseCache) {
				// weeklyResults missing entirely, but cache matches (rare)
				// (optional) you can also gate this on !allFinalForRealWeek if you want consistency
				const data = safeClone(liveScoringLiveWeek);
				const ls = data?.liveScoring;

				LSMLiveScoring = {};

				if (ls && hasOwn(ls, "matchup")) {
					const mu = ls.matchup;
					LSMLiveScoring.matchup = hasOwn(mu, "franchise") ? [mu] : asArray(mu);
				}

				if (ls && hasOwn(ls, "franchise")) {
					const fr = ls.franchise;
					LSMLiveScoring.franchise = hasOwn(fr, "id") ? [fr] : asArray(fr);
				}

				usedFallbackCache = true;

			} else {
				LSMLiveScoring = {};
			}


			applyByeLogicToLSM(LSMLiveScoring);

			// Only do schedule overlay when we fell back to liveScoring,
			// because weeklyResults already represents finalized matchups for that week.
			if (usedFallbackCache) {
				mergeWeeklyScheduleWithLive(real_ls_week, LSMLiveScoring);
			}

			normalizeAllFranchises(LSMLiveScoring);

			// IMPORTANT: previous week should not recompute from ls_stats
			if (usedFallbackCache) {
				if (canUseCache && !allFinalForRealWeek) {
					// Games not final yet â€” use stats-based scoring
					scoreAllFranchisesCurrentWeek(LSMLiveScoring);
				} else {
					// Games final OR not cache week â€” just normalize API scores
					normalizeNonCurrentWeekScores(LSMLiveScoring, real_ls_week);
				}
			}

		} else {

			let data;

			const canUseCache = real_ls_week === liveScoringWeek && liveScoringLiveWeek;
			if (canUseCache) {
				data = safeClone(liveScoringLiveWeek);
			} else {
				const url = `${baseURLDynamic}/${year}/export?TYPE=liveScoring&L=${league_id}&WEEK=${real_ls_week}&JSON=1&DETAILS=1&random=${randomValue}`;
				const response = await fetch(url);
				if (!response.ok) throw new Error("Network response was not ok");

				data = await response.json();
				if (data?.error) throw new Error(data.error.$t);
			}

			LSMLiveScoring = {};

			if (hasOwn(data && data.liveScoring, "matchup")) {
				const mu = data.liveScoring.matchup;
				LSMLiveScoring.matchup = hasOwn(mu, "franchise") ? [mu] : asArray(mu);
			}

			if (hasOwn(data && data.liveScoring, "franchise")) {
				const fr = data.liveScoring.franchise;
				LSMLiveScoring.franchise = hasOwn(fr, "id") ? [fr] : asArray(fr);
			}

			applyByeLogicToLSM(LSMLiveScoring);

			// Overlay weekly schedule matchups (if available)
			mergeWeeklyScheduleWithLive(real_ls_week, LSMLiveScoring);

			// Normalize all franchise/player structures on EVERY object
			normalizeAllFranchises(LSMLiveScoring);

			if (LSMcurrentWeek) {
				scoreAllFranchisesCurrentWeek(LSMLiveScoring);
			} else {
				normalizeNonCurrentWeekScores(LSMLiveScoring, real_ls_week);
			}
		}
	} catch (error) {
		console.error("[LSM] getLSMLiveScoring error:", error);
		if (!LSMLiveScoring || Array.isArray(LSMLiveScoring)) {
			LSMLiveScoring = {};
		}
		return;
	} finally {
		if (hasAVGMatchup(LSMLiveScoring)) {
			applyAVGFranchiseScore(
				LSMLiveScoring,
				franchiseDatabase,
				precision,
				format_points
			);
		}
	}
}

// API LOAD ALL DATA - INITIAL LOAD //
async function LSMload() {
	LSMcurrentWeek = false;
	LSMpreviousWeek = false;
	LSMfutureWeek = false;
	if (liveScoringWeek > real_ls_week) {
		LSMpreviousWeek = true;
	} else if (real_ls_week === currentWeekLSModule && real_ls_week !== completedWeek && liveScoringWeek <= AllGamesCount) {
		LSMcurrentWeek = true;
	} else if (real_ls_week <= completedWeek || completedWeek >= AllGamesCount) {
		LSMpreviousWeek = true;
	} else if (real_ls_week >= completedWeek) {
		LSMfutureWeek = true;
	}
	if (!LSMfutureWeek) {
		if (real_ls_week === liveScoringWeek) {
			lsmGetLiveStats();
		} else {
			await lsmGetLiveStats();
		}
	}
	try {
		const promises = [
			getLSMPlayers(),
			getLSMLiveScoring()
		];
		const results = await Promise.all(promises.map(promise => promise.catch(error => error)));

		const scheduleRecord = reportNflSchedule_ar?.[`w_${real_ls_week}`];

		let matchups = null;

		if (scheduleRecord && scheduleRecord.nflSchedule && scheduleRecord.nflSchedule.matchup) {
			matchups = scheduleRecord.nflSchedule.matchup;
			if (!Array.isArray(matchups)) matchups = [matchups];

			// Only rebuild matchups if week changed or we don't have them yet
			if (lsmScheduleWeek !== real_ls_week || !lsmNFLmatchups.length) {

				// Keep a clean base schedule and a working copy
				lsmNFLschedule = matchups;

				lsmNFLmatchups = (typeof structuredClone === "function") ?
					structuredClone(lsmNFLschedule) :
					JSON.parse(JSON.stringify(lsmNFLschedule));

				/* ============================
				   ADD THIS BLOCK RIGHT HERE
				   ============================ */
				for (let i = 0; i < lsmNFLmatchups.length; i++) {
					const m = lsmNFLmatchups[i];

					const kickoff = String(m.kickoff ?? 0);

					const ids = (m.team || [])
						.map(t => t && t.id)
						.filter(Boolean)
						.map(String)
						.sort();

					const teamsKey = ids.length ? ids.join('_') : `IDX_${i}`;

					m.matchupKey = `${kickoff}_${teamsKey}`;
				}
				/* ============================ */

				lsmScheduleWeek = real_ls_week;
			}

			lsm_noNFLGames = false;

		} else {
			lsmNFLmatchups = [];
			lsm_noNFLGames = true;
			if (lsmNFLBox) lsmNFLBox.innerHTML = '<h2 class="lsm_error" style="margin:0 auto;">No NFL Games Scheduled For Selected Week</h2>';
		}

		// Always re-run the parse step to apply latest stats
		LSMparseArrays();

		const promisesFuture = [
			LSMbuildNFLbox(),
			LSMbuildMatchupsInitial(),
			LSMbuildMatchupsPlayers(LSMmatchupIndex)
		];
		const resultsNext = await Promise.allSettled(promisesFuture);

		LSMhideShow.style.display = 'block';
		if (LSMmatchupBox && !LSMmatchupBox.hasChildNodes()) {
			LSMmatchupBox.innerHTML = "";
			LSMmatchupBox.style.display = 'none';
			document.body.classList.add('failedLoad');
		} else {
			LSMmatchupBox.style.display = 'block';
			document.body.classList.remove('failedLoad');
		}
		if (LSMLiveScoring.matchup || LSMLiveScoring.franchise) {
			document.body.classList.remove('failedLoad');
		} else {
			LSMmatchupBox.innerHTML = "";
			LSMmatchupBox.style.display = 'none';
			document.body.classList.add('failedLoad');
			LSMscoringBox.innerHTML = '<h2 class="lsm_error" style="margin:0 auto;">Error getting live scoring. Starters may be hidden or no matchups scheduled.</h2>';
		}
		if (real_ls_week > endWeek) {
			LSMmatchupBox.innerHTML = "";
			LSMmatchupBox.style.display = 'none';
			LSMscoringBox.innerHTML = `<h2 class="lsm_error" style="margin:0 auto;">No Fantasy Matchups for selected week. Fantasy League ends week ${endWeek}.</h2>`;
		}

		if (startWeek > real_ls_week) {
			LSMmatchupBox.innerHTML = "";
			LSMmatchupBox.style.display = 'none';
			LSMscoringBox.innerHTML = `<h2 class="lsm_error" style="margin:0 auto;">No Fantasy Matchups for selected week. Fantasy League starts week ${startWeek}.<br>Live Week begins 24 hours prior to kickoff of first game of the week.</h2>`;
		}


	} catch (error) {
		LSMhideShow.innerHTML = `<button onclick="window.location.href='${baseURLDynamic}/${year}/ajax_ls?L=${league_id}'">Try Default Live Scoring Page</button>`;
		LSMhideShow.style.display = 'block';
		console.error("Error:", error);
	}
}

// API LOAD ALL DATA - INITIAL LOAD //
async function LSMupdate() {
	if (real_ls_week !== liveScoringWeek) {
		//console.log("update - non live week returned");
		return;
	}
	lsmUpdateCount++;

	if (lsmUpdateCount === 6) {
		if (lsm_anyHiddenStarters) {
			await fetchScoringFunctions();
		}
	}

	lsmGetLiveStats();
	try {
		const promises = [
			getLSMPlayers(),
			getLSMLiveScoring()
		];
		const results = await Promise.all(promises.map(promise => promise.catch(error => error)));
		LSMparseArrays();

		if (lsmUpdateCount === 6) {
			const promisesFuture = [
				LSMbuildNFLbox(),
				LSMbuildMatchupsInitial(),
				LSMbuildMatchupsPlayers(LSMmatchupIndex)
			];
			const resultsNext = await Promise.allSettled(promisesFuture);
			//console.log("updated 6 times");
			lsmUpdateCount = 0;
			// do updates only
		} else {
			const promisesFuture = [
				LSMupdateNFLbox(),
				(LSMshouldRebuildMatchups() ?
					LSMbuildMatchupsInitial() :
					LSMupdateMatchupsOnly()
				),
				LSMbuildMatchupsPlayers(LSMmatchupIndex)
			];

			const resultsNext = await Promise.allSettled(promisesFuture);
		}
	} catch (error) {
		LSMhideShow.innerHTML = `<button onclick="window.location.href='${baseURLDynamic}/${year}/ajax_ls?L=${league_id}'">Try Default Live Scoring Page</button>`;
		LSMhideShow.style.display = 'block';
		console.error("Error:", error);
	}
}

// FUNCTIONS FOR CHECKBOXES //
function populateWeekSelectorLSModule() {
	if (!lsShowNFLbox) {
		var selectBox = document.getElementById("weekSelectorLSModule");
		for (var i = startWeek; i <= endWeek; i++) {
			var option = document.createElement("option");
			option.value = i;
			option.text = "Week " + i;
			selectBox.appendChild(option);
		}
		selectBox.value = real_ls_week;
	} else {
		var selectBox = document.getElementById("weekSelectorLSModule");
		for (var i = 1; i <= AllGamesCount; i++) {
			var option = document.createElement("option");
			option.value = i;
			option.text = "Week " + i;
			selectBox.appendChild(option);
		}
		selectBox.value = real_ls_week;
	}
	selectBox.addEventListener("change", function () {
		handleSelectChange(selectBox);
	});
	if (real_ls_week > endWeek) {
		const checkProjections = document.querySelector("#LSModuleCheckProjections");
		const checkStats = document.querySelector("#LSModuleCheckStats");
		const checkBench = document.querySelector("#LSModuleCheckBench");
		if (checkProjections) checkProjections.style.display = "none";
		if (checkStats) checkStats.style.display = "none";
		if (checkBench) checkBench.style.display = "none";
	}
}

function handleSelectChange(selectBox) {
	if (selectBox.value === "") {
		// do nothing
	} else {
		real_ls_week = parseInt(selectBox.value, 10);
		const weekNoElement = document.querySelector("#LSModuleSettings #lsmWeekNo");
		if (weekNoElement) {
			weekNoElement.innerHTML = "Week " + real_ls_week;
		}
		const checkProjections = document.querySelector("#LSModuleCheckProjections");
		const checkStats = document.querySelector("#LSModuleCheckStats");
		const checkBench = document.querySelector("#LSModuleCheckBench");
		if (real_ls_week <= currentWeekLSModule) {
			if (checkProjections) checkProjections.style.display = "inline-block";
			if (checkStats) checkStats.style.display = "inline-block";
			if (checkBench) checkBench.style.display = "inline-block";
		}
		if (real_ls_week > currentWeekLSModule) {
			if (checkStats) checkStats.style.display = "none";
		}
		if (real_ls_week > endWeek) {
			if (checkProjections) checkProjections.style.display = "none";
			if (checkStats) checkStats.style.display = "none";
			if (checkBench) checkBench.style.display = "none";
		}
		matchupContent = {};
		LSMmatchupIndex = 0;
		LSMload();
		const el = document.querySelector('.nfl-box-scroll-wrap');
		if (el) {
			el.scrollLeft = 0;
		}
	}
}

function LSModule_checkbox(which, checkbox) {
	const styles = {
		projections: '.hideProjections',
		bench: '.hideBENCH',
		stats: '.hideSTATS',
		nflBox: '.hideNFL',
	};

	const styleTag = document.createElement('style');
	styleTag.className = 'hideNFL';
	styleTag.textContent = '.nfl-box-scroll-wrap{display:none!important}';

	const styleTag1 = document.createElement('style');
	styleTag1.className = 'hideProjections';
	styleTag1.textContent = '.hide-proj,#LSscoringBox .player-projected-score,#LSscoringBox .lsPPTotalsDiv,#LSscoringBox .lsPPTotalsPts,.matchup-box-scroll-wrap .franchise-pp-scroll{display:none!important}';

	const styleTag2 = document.createElement('style');
	styleTag2.className = 'hideSTATS';
	styleTag2.textContent = '#LSscoringBox .player-stats{display:none!important}';

	const styleTag3 = document.createElement('style');
	styleTag3.className = 'hideBENCH';
	styleTag3.textContent = '#LSscoringBox .players-bench{display:none!important}';

	if (checkbox.checked) {
		localStorage.setItem("LSModule_" + which + "_" + league_id, "0");
		const existingStyle = document.querySelector(styles[which]);
		if (existingStyle) {
			existingStyle.remove();
		}
	} else {
		localStorage.setItem("LSModule_" + which + "_" + league_id, "1");
		const styleToAdd = styles[which] === styles.nflBox ?
			styleTag :
			styles[which] === styles.projections ?
			styleTag1 :
			styles[which] === styles.stats ?
			styleTag2 :
			styleTag3;
		document.body.appendChild(styleToAdd);
	}
}

function LSModuletoggleSlide() {
	document.querySelectorAll(".lsModuleSlide").forEach((element) => {
		const isHidden = getComputedStyle(element).display === "none";

		if (isHidden) {
			// Show the element
			element.style.display = "block"; // Make it visible to calculate height
			const fullHeight = element.scrollHeight + "px"; // Get the natural height
			element.style.height = "0"; // Set initial height to 0
			element.style.overflow = "hidden"; // Prevent content overflow
			element.style.transition = "height 0.5s ease"; // Add smooth transition

			// Trigger the animation to full height
			requestAnimationFrame(() => {
				element.style.height = fullHeight;
			});

			element.addEventListener("transitionend", function onTransitionEnd() {
				element.style.height = ""; // Reset height to auto for responsiveness
				element.style.overflow = ""; // Clear overflow style
				element.style.transition = ""; // Remove transition
				element.removeEventListener("transitionend", onTransitionEnd);
			});
		} else {
			// Hide the element
			const currentHeight = element.scrollHeight + "px"; // Get current height
			element.style.height = currentHeight; // Set current height explicitly
			element.style.overflow = "hidden"; // Prevent content overflow
			element.style.transition = "height 0.5s ease"; // Add smooth transition

			// Trigger the animation to height 0
			requestAnimationFrame(() => {
				element.style.height = "0";
			});

			element.addEventListener("transitionend", function onTransitionEnd() {
				element.style.display = "none"; // Hide the element after transition
				element.style.height = ""; // Clear height
				element.style.overflow = ""; // Clear overflow style
				element.style.transition = ""; // Remove transition
				element.removeEventListener("transitionend", onTransitionEnd);
			});
		}
	});
}

// GET LIVE STATS - run on initial load , select different weeks and refresh - do not run on future weeks //
async function lsmGetLiveStats() {
	let new_ls_stats = ls_stats; // default: keep current if we fail / skip
	let new_ls_tstats = ls_tstats;

	if (!LSMfutureWeek) {
		if (real_ls_week === liveScoringWeek) {
			lsm_last_update = lsm_last_update_secs_first;
			if (typeof structuredClone === "function") {
				new_ls_stats = structuredClone(lsm_stats);
				new_ls_tstats = structuredClone(lsm_tstats);
			} else {
				new_ls_stats = JSON.parse(JSON.stringify(lsm_stats));
				new_ls_tstats = JSON.parse(JSON.stringify(lsm_tstats));
			}
		} else {
			// Fetch and parse live_stats file into NEW objects
			let now;
			if (!Date.now) now = new Date().getTime();
			else now = Date.now();

			const week = real_ls_week < 10 ? "0" + real_ls_week : real_ls_week;
			const url = xmlBaseURL + "live_stats_idp_" + week + ".txt?RANDOM=" + now;

			try {
				const response = await fetch(url);
				const data = await response.text();

				// Start fresh for this snapshot
				const temp_ls_stats = [];
				const temp_ls_tstats = [];

				const lines = data.split("\n");
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					if (!line) continue;

					const fields = line.split("|");
					const tag = fields[0];

					if (tag === "DATE") {
						lsm_last_update = fields[1];
						ls_last_update = fields[2];
						continue;
					}
					if (tag === "REFRESH") {
						continue; // IGNORE
					}

					// Player row if first field is numeric
					if (!isNaN(tag)) {
						const pid = tag;
						if (typeof temp_ls_stats[pid] === "undefined") temp_ls_stats[pid] = {};
						for (let j = 1; j < fields.length; j++) {
							const onestat = fields[j].split(" ");
							temp_ls_stats[pid][onestat[0]] = onestat[1];
						}
					} else {
						// Team row
						const team = tag;
						if (typeof temp_ls_tstats[team] === "undefined") temp_ls_tstats[team] = {};
						for (let j = 1; j < fields.length; j++) {
							const onestat = fields[j].split(" ");
							temp_ls_tstats[team][onestat[0]] = onestat[1];
						}
					}
				}
				new_ls_stats = temp_ls_stats;
				new_ls_tstats = temp_ls_tstats;
			} catch (error) {
				// If fetch/parse fails, DO NOT wipe stats; keep previous globals
				// console.log("Error: " + error.message);
			}
		}
	}
	ls_stats = new_ls_stats;
	ls_tstats = new_ls_tstats;
}

// BUILD NFL BOX SCORES (FIXED LAYOUT / UPDATE-FRIENDLY) //
function LSMbuildNFLbox() {
	if (lsm_noNFLGames) return;
	if (!Array.isArray(lsmNFLmatchups) || !lsmNFLmatchups.length) return;

	const NFLBoxParts = [];

	// Fixed column count for every team row and the footer row
	const COLS = 6;

	// Small helpers
	const toInt = v => {
		const n = parseInt(v, 10);
		return Number.isFinite(n) ? n : 0;
	};

	const safeText = v => (v === undefined || v === null) ? "" : String(v);

	// Decide which "mode" drives the display
	// - previous week always FINAL-like
	// - future week always SCHED-like
	// - current week uses matchup.status
	const getViewStatus = (matchup) => {
		if (LSMpreviousWeek) return "FINAL";
		if (LSMfutureWeek) return "SCHED";
		if (LSMcurrentWeek) return matchup.status || "SCHED";
		return matchup.status || "SCHED";
	};

	lsmNFLmatchups.forEach((matchup, matchupIndex) => {
		const teams = Array.isArray(matchup.team) ? matchup.team : [];
		if (!teams.length) return;

		// matchupKey (stable identity for updates)
		const ids = teams.map(t => t.id).filter(Boolean).sort();
		const matchupKey = `${matchup.kickoff || 0}_${ids.join('_')}`;
		const initialOrder = matchupIndex;
		const dataAttrs = `data-matchup-key="${matchupKey}" data-order="${initialOrder}"`;

		const viewStatus = getViewStatus(matchup);
		const hasScoreChange = (viewStatus === "INPROG" && matchup.scoreChange === true);
		const isClickable = (viewStatus !== "SCHED"); // you can refine later if needed

		// Compute lowest spread team only when spreads are relevant
		let lowestSpreadTeam = null;
		if (viewStatus === "SCHED") {
			lowestSpreadTeam = teams.reduce((minSpreadTeam, team) => {
				const teamSpread = parseFloat(team.spread) || 0;
				if (teamSpread < minSpreadTeam.spread) {
					return {
						id: team.id,
						spread: teamSpread
					};
				}
				return minSpreadTeam;
			}, {
				id: "",
				spread: Infinity
			});
		}

		// Container status class (stable)
		let containerStatusClass = "ls-game-scheduled";
		if (viewStatus === "INPROG") containerStatusClass = "ls-game-in-progress";
		if (viewStatus === "FINAL") containerStatusClass = "ls-game-is-final";

		// Open matchup container (stable structure, just class + pointer behavior)
		const containerStyle = isClickable ?
			`style="cursor:pointer;order:${initialOrder}"` :
			`style="order:${initialOrder};pointer-events:none"`;

		NFLBoxParts.push(
			`<div class="matchup_container ${containerStatusClass}${hasScoreChange ? " scoreChange" : ""}" ${dataAttrs} ${containerStyle}>` +
			`<table class="nfl-box-scroll"><tbody>`
		);

		// Build each team row (ALWAYS same 6 td columns)
		teams.forEach(team => {
			const teamId = team.id;
			const teamStat = (ls_tstats && teamId && ls_tstats[teamId]) ? ls_tstats[teamId] : null;

			// -------- Scores (determine once; display depends on status) --------
			let teamScore = "";
			let teamOppScore = "";

			if (LSMpreviousWeek) {
				let s = 0;
				let o = 0;

				if (teamStat && teamStat.TPS !== undefined && teamStat.TPS !== "") {
					s = toInt(teamStat.TPS);
				} else if (team.score !== undefined && team.score !== "") {
					s = toInt(team.score);
				}

				const opponent = teams.find(t => t.id !== teamId);
				if (teamStat && teamStat.TPA !== undefined && teamStat.TPA !== "") {
					o = toInt(teamStat.TPA);
				} else if (opponent && opponent.score !== undefined && opponent.score !== "") {
					o = toInt(opponent.score);
				}

				teamScore = String(s);
				teamOppScore = String(o);
			} else if (LSMcurrentWeek) {
				if (team.score !== undefined && team.score !== "") {
					teamScore = safeText(team.score);
				}
				if (team.OPPscore !== undefined && team.OPPscore !== "") {
					teamOppScore = safeText(team.OPPscore);
				} else if (teamStat && teamStat.TPA !== undefined && teamStat.TPA !== "") {
					teamOppScore = String(toInt(teamStat.TPA));
				}
			}

			// Winner marker only relevant for FINAL/previous
			let winnerHTML = "";
			let winnerCellExtraClass = "";
			if (viewStatus === "FINAL") {
				const sNum = toInt(teamScore);
				const oNum = toInt(teamOppScore);

				if (sNum > oNum) {
					winnerHTML = `<i class="fa-regular fa-caret-left" aria-hidden="true"></i>`;
				} else if (sNum === oNum && (teamScore !== "" || teamOppScore !== "")) {
					winnerHTML = `T`;
					winnerCellExtraClass = " ls-tied";
				} else {
					// leave blank
				}
			}

			// -------- Spread / Record (relevant for scheduled view only) --------
			let spreadText = "";
			let isLowestSpread = false;
			if (viewStatus === "SCHED" && real_ls_week < currentWeekLSModule + 1) {
				if (lowestSpreadTeam && teamId === lowestSpreadTeam.id) {
					spreadText = safeText(lowestSpreadTeam.spread);
					isLowestSpread = true;
				}
			}

			let recordText = "";
			if (viewStatus === "SCHED") {
				if (completedWeek !== 0) {
					const rec = reportNflScheduleFid_ar?.[teamId]?.[real_ls_week]?.runRec;
					recordText = rec ? `(${rec})` : `(0-0-0)`;
				} else {
					recordText = `(0-0-0)`;
				}
			}

			// -------- INPROG indicators (live only) --------
			const hasBall = (viewStatus === "INPROG" && team.hasPossession === "true");
			const showDownDist = (viewStatus === "INPROG" && team.downDistance === "true" && safeText(team.down_and_dist));
			const inRedZone = (viewStatus === "INPROG" && team.inRedZone === "true");

			// mutually exclusive indicator: redzone wins over hasBall
			const showRedzoneIcon = (hasBall && inRedZone);
			const showHasBallIcon = (hasBall && !showRedzoneIcon);

			const hasBallHTML = showHasBallIcon ?
				`<img src="//www.mflscripts.com/ImageDirectory/script-images/football.svg" alt="has ball" title="has ball" style="height:0.75rem">` :
				``;

			const redzoneHTML = showRedzoneIcon ?
				`<img src="//www.mflscripts.com/ImageDirectory/script-images/goal-post.svg" alt="redzone" title="redzone" style="height:0.75rem">` :
				``;

			const downDistText = showDownDist ? safeText(team.down_and_dist) : "";

			// -------- What should be visible per status --------
			const showScheduledCols = (viewStatus === "SCHED");
			const showInprogCols = (viewStatus === "INPROG");
			const showFinalCols = (viewStatus === "FINAL");

			const showScore = (showInprogCols || showFinalCols);
			const showWinner = (showFinalCols);

			// Row open
			NFLBoxParts.push(
				`<tr title="View ${teamId} Box Score" class="eachTeam" data-team="${teamId}" onclick="getBoxScoreNFL(this)">`
			);

			// (1) TEAM IMG
			NFLBoxParts.push(
				`<td class="ls-nfl-team-img"><img src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${teamId}.svg" title="${teamId}" style="vertical-align:middle"><span class="lsm-team-abbr" data-role="abbr" style="vertical-align:middle">${teamId}</span></td>`
			);

			// (2) SPREAD / HAS BALL (same cell always)
			// Keep both classes so existing CSS (td.ls-nfl-spread or td.ls-nfl-team-hasBall) can still hit.
			NFLBoxParts.push(
				`<td class="ls-nfl-spread ls-nfl-team-hasBall${isLowestSpread ? " lowest-spread" : ""}" style="text-align:right">` +
				(showScheduledCols ? safeText(spreadText) : (showInprogCols ? hasBallHTML : "")) +
				`</td>`
			);

			// (3) RECORD / REDZONE (same cell always)
			NFLBoxParts.push(
				`<td class="lsm-nfl-records ls-nfl-team-redzone" style="font-style:italic;font-size:.7rem;padding-right:0.5rem;text-align:right">` +
				(showScheduledCols ? safeText(recordText) : (showInprogCols ? redzoneHTML : "")) +
				`</td>`
			);

			// (4) DOWN & DISTANCE (same cell always)
			NFLBoxParts.push(
				`<td class="ls-down-distance" style="text-align:center;font-size:0.55rem;white-space:nowrap;font-style:italic">` +
				(showInprogCols ? safeText(downDistText) : "") +
				`</td>`
			);

			// (5) SCORE (same cell always; blank when not shown)
			NFLBoxParts.push(
				`<td class="ls-nfl-score" style="text-align:right;">` +
				(showScore ? safeText(teamScore) : "") +
				`</td>`
			);

			// (6) WINNER (same cell always; blank when not shown)
			// Never force display:none!important here; keep cell stable for updates.
			NFLBoxParts.push(
				`<td class="ls-nfl-winner${winnerCellExtraClass}" style="text-align:right;">` +
				(showWinner ? winnerHTML : "") +
				`</td>`
			);

			NFLBoxParts.push(`</tr>`);
		});

		// Footer row (ALWAYS present; one TD with stable colspan)
		let footerClass = "ls-nfl-gametime-scheduled";
		let footerText = `${safeText(matchup.gameTime)} ${safeText(lsmTimeZone)}`;

		if (viewStatus === "INPROG") {
			footerClass = "ls-nfl-gametime-inprog";
			const t0 = teams[0] || {};
			footerText = `${safeText(t0.Remaining)}${safeText(t0.Quarter)}`;
		} else if (viewStatus === "FINAL") {
			footerClass = "ls-nfl-gametime-final";
			const finalLabel = matchup.overtime ? "Final/OT" : "Final";
			footerText = finalLabel;
		}

		NFLBoxParts.push(
			`<tr>` +
			`<td class="${footerClass}" colspan="${COLS}" style="text-align:center;font-size:0.7rem;white-space:nowrap">` +
			footerText +
			`</td>` +
			`</tr>`
		);

		// Close matchup container
		NFLBoxParts.push(`</tbody></table></div>`);
	});

	if (lsmNFLBox) {
		lsmNFLBox.innerHTML = NFLBoxParts.join("");
	}
}

function lsmNewsEnabled() {
	return (
		window.MFLPopupEnablePlayerNews === true &&
		window.MFLnewsEnableScoreboard === true
	);
}

function lsmGetNewsAttr(pid) {
	if (!lsmNewsEnabled()) return null;

	if (typeof window.newsBreaker === "undefined") return "news";

	const key = "pid_" + pid;
	if (window.newsBreaker[key] === undefined) return "no-news";
	if (window.newsBreaker[key] === 0) return "new-news";
	return "recent-news";
}

// UPDATE NFL BOX SCORES //
function LSMupdateNFLbox() {
	if (!lsmNFLBox || !Array.isArray(lsmNFLmatchups) || !lsmNFLmatchups.length) return;

	// helpers
	const toInt = v => {
		const n = parseInt(v, 10);
		return Number.isFinite(n) ? n : 0;
	};
	const safeText = v => (v === undefined || v === null) ? "" : String(v);

	// view status must mirror LSMbuildNFLbox()
	const getViewStatus = (matchup) => {
		if (LSMpreviousWeek) return "FINAL";
		if (LSMfutureWeek) return "SCHED";
		if (LSMcurrentWeek) return matchup.status || "SCHED";
		return matchup.status || "SCHED";
	};

	const setOneOfClasses = (el, classList, keepClass) => {
		// remove all in classList, then add keepClass
		for (const c of classList) el.classList.remove(c);
		if (keepClass) el.classList.add(keepClass);
	};

	// Icon HTML (same as build)
	const FOOTBALL_ICON = `<img src="//www.mflscripts.com/ImageDirectory/script-images/football.svg" alt="has ball" title="has ball" style="height:0.75rem">`;
	const GOALPOST_ICON = `<img src="//www.mflscripts.com/ImageDirectory/script-images/goal-post.svg" alt="redzone" title="redzone" style="height:0.75rem">`;
	const WINNER_ICON = `<i class="fa-regular fa-caret-left" aria-hidden="true"></i>`;

	// map DOM containers by matchup key
	const boxByKey = new Map();
	lsmNFLBox.querySelectorAll('.matchup_container[data-matchup-key]').forEach(el => {
		boxByKey.set(el.dataset.matchupKey, el);
	});

	for (let i = 0; i < lsmNFLmatchups.length; i++) {
		const m = lsmNFLmatchups[i];
		if (!m) continue;

		const teams = Array.isArray(m.team) ? m.team : [];
		if (!teams.length) continue;

		const ids = teams.map(t => t && t.id).filter(Boolean).sort();
		const key = `${m.kickoff || 0}_${ids.join('_')}`;

		const el = boxByKey.get(key);
		if (!el) continue;

		// ORDER (keep what you already had)
		const newOrder = (m.order != null) ? m.order : i;
		el.style.order = String(newOrder);
		el.dataset.order = String(newOrder);

		// VIEW STATE
		const viewStatus = getViewStatus(m);
		const isClickable = (viewStatus !== "SCHED");

		// container status class
		let containerStatusClass = "ls-game-scheduled";
		if (viewStatus === "INPROG") containerStatusClass = "ls-game-in-progress";
		if (viewStatus === "FINAL") containerStatusClass = "ls-game-is-final";

		setOneOfClasses(el, ["ls-game-scheduled", "ls-game-in-progress", "ls-game-is-final"], containerStatusClass);

		el.classList.toggle("scoreChange", viewStatus === "INPROG" && m.scoreChange === true);

		// clickability (matches build behavior)
		if (isClickable) {
			el.style.cursor = "pointer";
			el.style.pointerEvents = "";
		} else {
			el.style.cursor = "";
			el.style.pointerEvents = "none";
		}

		// lowest spread (only relevant for SCHED view)
		let lowestSpreadTeam = null;
		if (viewStatus === "SCHED") {
			lowestSpreadTeam = teams.reduce((minSpreadTeam, team) => {
				const teamSpread = parseFloat(team.spread) || 0;
				if (teamSpread < minSpreadTeam.spread) {
					return {
						id: team.id,
						spread: teamSpread
					};
				}
				return minSpreadTeam;
			}, {
				id: "",
				spread: Infinity
			});
		}

		// Update each team row
		for (const team of teams) {
			const teamId = team && team.id;
			if (!teamId) continue;

			const row = el.querySelector(`tr.eachTeam[data-team="${teamId}"]`);
			if (!row) continue;

			// Grab the fixed cells by class (stable layout)
			//const tdImg = row.querySelector("td.ls-nfl-team-img"); // not updated
			const tdSpreadOrBall = row.querySelector("td.ls-nfl-spread.ls-nfl-team-hasBall");
			const tdRecordOrRZ = row.querySelector("td.lsm-nfl-records.ls-nfl-team-redzone");
			const tdDownDist = row.querySelector("td.ls-down-distance");
			const tdScore = row.querySelector("td.ls-nfl-score");
			const tdWinner = row.querySelector("td.ls-nfl-winner");

			// stats
			const teamStat = (typeof ls_tstats !== "undefined" && ls_tstats && ls_tstats[teamId]) ? ls_tstats[teamId] : null;

			// Scores: mirror build logic
			let teamScore = "";
			let teamOppScore = "";

			if (LSMpreviousWeek) {
				let s = 0,
					o = 0;

				if (teamStat && teamStat.TPS !== undefined && teamStat.TPS !== "") {
					s = toInt(teamStat.TPS);
				} else if (team.score !== undefined && team.score !== "") {
					s = toInt(team.score);
				}

				const opponent = teams.find(t => t.id !== teamId);
				if (teamStat && teamStat.TPA !== undefined && teamStat.TPA !== "") {
					o = toInt(teamStat.TPA);
				} else if (opponent && opponent.score !== undefined && opponent.score !== "") {
					o = toInt(opponent.score);
				}

				teamScore = String(s);
				teamOppScore = String(o);
			} else if (LSMcurrentWeek) {
				if (team.score !== undefined && team.score !== "") {
					teamScore = safeText(team.score);
				}
				if (team.OPPscore !== undefined && team.OPPscore !== "") {
					teamOppScore = safeText(team.OPPscore);
				} else if (teamStat && teamStat.TPA !== undefined && teamStat.TPA !== "") {
					teamOppScore = String(toInt(teamStat.TPA));
				}
			}

			// Winner marker (FINAL view only)
			let winnerHTML = "";
			let isTied = false;
			if (viewStatus === "FINAL") {
				const sNum = toInt(teamScore);
				const oNum = toInt(teamOppScore);
				if (sNum > oNum) winnerHTML = WINNER_ICON;
				else if (sNum === oNum && (teamScore !== "" || teamOppScore !== "")) {
					winnerHTML = "T";
					isTied = true;
				}
			}

			// Scheduled values
			let spreadText = "";
			let isLowest = false;

			if (viewStatus === "SCHED" && real_ls_week < currentWeekLSModule + 1) {
				if (lowestSpreadTeam && teamId === lowestSpreadTeam.id) {
					spreadText = safeText(lowestSpreadTeam.spread);
					isLowest = true;
				}
			}

			let recordText = "";
			if (viewStatus === "SCHED") {
				if (completedWeek !== 0) {
					const rec = reportNflScheduleFid_ar?.[teamId]?.[real_ls_week]?.runRec;
					recordText = rec ? `(${rec})` : `(0-0-0)`;
				} else {
					recordText = `(0-0-0)`;
				}
			}

			// INPROG indicators
			const hasBall = (viewStatus === "INPROG" && team.hasPossession === "true");
			const showDownDist = (viewStatus === "INPROG" && team.downDistance === "true" && safeText(team.down_and_dist));
			const inRedZone = (viewStatus === "INPROG" && team.inRedZone === "true");

			// mutually exclusive indicator: redzone wins over hasBall
			const showRedzoneIcon = (hasBall && inRedZone);
			const showHasBallIcon = (hasBall && !showRedzoneIcon);

			// what to show
			const showScheduledCols = (viewStatus === "SCHED");
			const showInprogCols = (viewStatus === "INPROG");
			const showFinalCols = (viewStatus === "FINAL");
			const showScore = (showInprogCols || showFinalCols);
			const showWinner = (showFinalCols);

			// (2) Spread / HasBall cell
			if (tdSpreadOrBall) {
				tdSpreadOrBall.classList.toggle("lowest-spread", !!isLowest);
				tdSpreadOrBall.style.textAlign = "right";

				if (showScheduledCols) {
					tdSpreadOrBall.innerHTML = safeText(spreadText);
				} else if (showInprogCols) {
					tdSpreadOrBall.innerHTML = showHasBallIcon ? FOOTBALL_ICON : "";
				} else {
					tdSpreadOrBall.innerHTML = "";
				}
			}

			// (3) Record / Redzone cell
			if (tdRecordOrRZ) {
				// keep your existing inline style expectations
				tdRecordOrRZ.style.fontStyle = "italic";
				tdRecordOrRZ.style.fontSize = ".7rem";
				tdRecordOrRZ.style.paddingRight = "0.5rem";
				tdRecordOrRZ.style.textAlign = "right";

				if (showScheduledCols) {
					tdRecordOrRZ.innerHTML = safeText(recordText);
				} else if (showInprogCols) {
					tdRecordOrRZ.innerHTML = showRedzoneIcon ? GOALPOST_ICON : "";
				} else {
					tdRecordOrRZ.innerHTML = "";
				}
			}

			// (4) Down & distance
			if (tdDownDist) {
				tdDownDist.style.textAlign = "center";
				tdDownDist.style.fontSize = "0.55rem";
				tdDownDist.style.whiteSpace = "nowrap";
				tdDownDist.style.fontStyle = "italic";

				tdDownDist.textContent = showInprogCols && showDownDist ? safeText(team.down_and_dist) : "";
			}

			// (5) Score
			if (tdScore) {
				tdScore.style.textAlign = "right";
				tdScore.textContent = showScore ? safeText(teamScore) : "";
			}

			// (6) Winner
			if (tdWinner) {
				tdWinner.style.textAlign = "right";
				tdWinner.classList.toggle("ls-tied", !!isTied);

				if (showWinner) tdWinner.innerHTML = winnerHTML;
				else tdWinner.innerHTML = "";
			}
		}

		// Footer row update (single td with colspan=6)
		const footerTd = el.querySelector("td.ls-nfl-gametime-scheduled, td.ls-nfl-gametime-inprog, td.ls-nfl-gametime-final");
		if (footerTd) {
			let footerClass = "ls-nfl-gametime-scheduled";
			let footerText = `${safeText(m.gameTime)} ${safeText(lsmTimeZone)}`;
			if (viewStatus === "INPROG") {
				footerClass = "ls-nfl-gametime-inprog";
				const t0 = teams[0] || {};
				footerText = `${safeText(t0.Remaining)}${safeText(t0.Quarter)}`;
			} else if (viewStatus === "FINAL") {
				footerClass = "ls-nfl-gametime-final";
				const finalLabel = m.overtime ? "Final/OT" : "Final";
				footerText = finalLabel;
			}
			footerTd.classList.remove("ls-nfl-gametime-scheduled", "ls-nfl-gametime-inprog", "ls-nfl-gametime-final");
			footerTd.classList.add(footerClass);
			footerTd.textContent = footerText;
		}
	}
}

// FORMAT KICKOFF TIMESTAMP //
function formatKickoffTimestamp(kickoffTimestamp, ScoringTimezone) {
	let timeZone;
	switch (ScoringTimezone) {
		case "ET":
			timeZone = 'America/New_York';
			break;
		case "CT":
			timeZone = 'America/Chicago';
			break;
		case "MT":
			timeZone = 'America/Denver';
			break;
		case "PT":
			timeZone = 'America/Los_Angeles';
			break;
		case "AKT":
			timeZone = 'America/Anchorage';
			break;
		case "HT":
			timeZone = 'America/Adak';
			break;
		case "GMT":
			timeZone = 'GMT';
			break;
		case "LOCAL":
			timeZone = undefined;
			break;
		default:
			timeZone = 'America/New_York';
			break;
	}
	const kickoffDate = new Date(kickoffTimestamp * 1000);
	const options = {
		timeZone,
		weekday: 'short',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true
	};
	return kickoffDate.toLocaleDateString(undefined, options);
}

// CLICK ON EACH NFL TEAM MATCHUP AND DISPLAY PLAYER GAME DETAILS //
function getBoxScoreNFL(element) {
	if (isRequestInProgress) {
		return;
	}
	isRequestInProgress = true;
	const dataTeam = element.getAttribute('data-team');
	const url = `${baseURLDynamic}/${year}/pro_matchup?L=${league_id}&W=${real_ls_week}&MATCHUP=${dataTeam}&YEAR=${year}&PRINTER=1`;
	fetch(url)
		.then(response => response.text())
		.then(html => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const twoColumnLayouts = doc.querySelectorAll('td.two_column_layout > table.report');
			const firstLayoutHTML = twoColumnLayouts[0] ? twoColumnLayouts[0].outerHTML : '';
			if (LSMteamBox) {
				LSMteamBox.innerHTML = firstLayoutHTML;
				LSMteamBox.classList.remove('details');
				LSMteamBox.style.display = 'block';
			}
			if (teamBoxOverlay) {
				teamBoxOverlay.style.display = 'block';
			}
			const caption = LSMteamBox.querySelector('#teamBox caption');
			if (caption) {
				const closeButton = document.createElement('i');
				closeButton.title = 'Close Boxscore';
				closeButton.style.cursor = 'pointer';
				closeButton.style.float = 'right';
				closeButton.className = 'fa-solid fa-circle-xmark';
				closeButton.setAttribute('onclick', 'removeTeamBox()');
				caption.appendChild(closeButton);
			}
			if (lsm_hideIDP) {
				LSMteamBox.querySelectorAll('#teamBox tr').forEach((row) => {
					if (row.textContent.includes('Defense')) {
						row.remove();
					}
				});
			}
			if (lsm_hidePunt) {
				LSMteamBox.querySelectorAll('#teamBox tr').forEach((row) => {
					if (row.textContent.includes('Punting')) {
						row.remove();
					}
				});
			}
			if (typeof MFLScoreDetailsPopup !== 'undefined' && MFLScoreDetailsPopup === true) {
				// The variable is defined and is true
			} else {
				const STYLE_ID = "lsm-teamBox-disable-points-links";
				if (!document.getElementById(STYLE_ID)) {
					const style = document.createElement("style");
					style.id = STYLE_ID;
					style.textContent = '#teamBox td.points a{pointer-events:none!important;text-decoration:none!important;}';
					document.head.appendChild(style);
				}
			}
			if (LSMteamBox) {
				LSMteamBox.scrollTop = 0;
			}
			isRequestInProgress = false;
			try {
				bodyScrollLock.disableBodyScroll(LSMteamBox);
			} catch (er) {};
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
}

function ls_explain_points_rows(pid, fallback = {}) {
	const key = pid == null ? "" : String(pid);

	// reset global explain accumulator that score_player uses
	if (typeof ls_explain !== "undefined") {
		ls_explain = "";
	} else {
		// if ls_explain doesn't exist, create it (optional)
		window.ls_explain = "";
	}

	// Safely access globals that might not exist
	const has_ls_player = (typeof ls_player !== "undefined" && ls_player);
	const has_ls_team_pos = (typeof ls_team_pos !== "undefined" && ls_team_pos);
	const has_ls_tstats = (typeof ls_tstats !== "undefined" && ls_tstats);
	const has_ls_stats = (typeof ls_stats !== "undefined" && ls_stats);
	const has_ls_cat_desc = (typeof ls_cat_desc !== "undefined" && ls_cat_desc);

	// Prefer ls_player, fallback to LSMLiveScoring attributes
	const lp = has_ls_player ? ls_player[key] : undefined;
	const pos = lp?.pos ?? fallback.pos ?? null;
	const nfl_team = lp?.nfl_team ?? fallback.team ?? null;

	if (!pos) {
		return {
			rows: [],
			text: ""
		};
	}

	// trigger scoring so ls_explain gets populated
	if (has_ls_team_pos && ls_team_pos[pos] == 1) {
		if (
			nfl_team &&
			!/^FA/.test(nfl_team) &&
			has_ls_tstats &&
			ls_tstats[nfl_team] != null &&
			typeof score_player === "function"
		) {
			score_player(nfl_team, pos);
		}
	} else if (has_ls_team_pos && ls_team_pos[pos] == 0) {
		if (
			has_ls_stats &&
			ls_stats[key] != null &&
			typeof score_player === "function"
		) {
			score_player(key, pos);
		}
	}

	// Parse ls_explain -> rows
	const rows = [];
	if (window.ls_explain) {
		const stats = window.ls_explain.split("|");
		for (let i = 0; i < stats.length; i++) {
			const rec = stats[i];
			if (!rec) continue;

			// expected: CAT,STATVALUE,POINTS
			const fields = rec.split(",");
			const cat = fields[0] ?? "";
			const val = fields[1] ?? "";
			const pts = fields[2] ?? "";

			const desc = has_ls_cat_desc ? (ls_cat_desc?.[cat] ?? cat) : cat;

			const eventText = `${val} ${desc}`.trim();
			const ptsText = String(pts).trim();

			if (eventText && ptsText) {
				rows.push({
					eventText,
					ptsText,
					cat,
					val,
					pts
				});
			}
		}
	}

	const text = rows.map(r => `* ${r.ptsText} points for ${r.eventText}`).join("\n");
	return {
		rows,
		text
	};
}


document.addEventListener("click", function (e) {
	const liveScoreEl = e.target?.closest?.(".player-live-score");
	if (!liveScoreEl) return;

	const rowEl = liveScoreEl.closest(".player-row");
	if (!rowEl) return;

	const isPlaying = rowEl.classList.contains("playing");
	const isDone = rowEl.classList.contains("done");

	// keep your old behavior: only popup if playing or done
	if (!isPlaying && !isDone) return;

	const playerID = liveScoreEl.dataset.pid || liveScoreEl.getAttribute("data-pid");
	if (!playerID) return;

	// --- SWITCH: explain if score_player exists, else fetch ---
	if (typeof score_player === "function") {
		const playerName =
			rowEl.querySelector(".player-details-box .player-name h3 a")?.textContent?.trim() ||
			rowEl.querySelector(".player-details-box .player-name h3")?.textContent?.trim() ||
			"";

		// Pull fallback pos/team from your new data attributes
		const pos = liveScoreEl.dataset.pos || null;
		const team = liveScoreEl.dataset.team || null;

		// âœ… Get breakdown rows from ls_explain
		const {
			rows
		} = ls_explain_points_rows(playerID, {
			pos,
			team
		});

		let projpts = 0;
		let pacePoints = 0;

		const scoreBox = liveScoreEl.parentElement; // .player-score-box
		const points = scoreBox?.querySelector(".player-live-score")?.textContent ?? "";
		const pointsNum = Number.parseFloat(String(points).trim());
		const EPS = 0.0001;

		if (isPlaying) {
			projpts = parseFloat(LSMplayerScoresByWeek?.[real_ls_week]?.[playerID]) || 0;
			pacePoints = scoreBox?.querySelector(".player-projected-score")?.textContent || "";
		} else if (isDone) {
			projpts = scoreBox?.querySelector(".player-projected-score")?.textContent || "";
		}

		const captionText = `Points Breakdown`;

		const newTable = document.createElement("table");
		newTable.setAttribute("align", "center");
		newTable.setAttribute("cellspacing", "1");
		newTable.className = "report";
		newTable.innerHTML = `
			<caption>
				<div class="teamBox-caption-wrap">
					<div class="teamBox-caption-top">
						<span class="teamBox-caption-title">${captionText}</span>
						<i title="Close Boxscore" style="cursor:pointer;float:right" class="fa-solid fa-circle-xmark" onclick="removeTeamBox()"></i>
					</div>
				</div>
			</caption>
			<tbody>
				<tr><td>
					<div class="appendStats">
						<div class="appendStats-ls-events"></div>
						<div class="appendStats-ls-pts"></div>
					</div>
				</td></tr>
			</tbody>`;

		if (playerName) {
			const appendStats = newTable.querySelector(".appendStats");
			if (appendStats) {
				const nameDiv = document.createElement("div");
				nameDiv.className = "teamBox-caption-player";
				nameDiv.textContent = `${playerName}${pos ? " Â· " + pos : ""}${team ? " Â· " + team : ""}`;
				appendStats.parentNode.insertBefore(nameDiv, appendStats);
			}
		}

		const eventsDiv = newTable.querySelector(".appendStats-ls-events");
		const ptsDiv = newTable.querySelector(".appendStats-ls-pts");

		let hasLowPoints = false;
		let totalPoints = 0;

		for (const r of rows) {
			hasLowPoints = true;

			const pts = Number(r.ptsText);
			if (Number.isFinite(pts)) totalPoints += pts;

			const eventElement = document.createElement("div");
			eventElement.className = "ls-events";
			eventElement.textContent = r.eventText;
			eventsDiv.appendChild(eventElement);

			const pointsElement = document.createElement("div");
			pointsElement.className = "ls-pts";
			pointsElement.textContent = r.ptsText;
			ptsDiv.appendChild(pointsElement);
		}

		// âœ… keep your subtotal in explain mode (unchanged)
		if (rows.length) {
			if (Number.isFinite(pointsNum) && Math.abs(totalPoints - pointsNum) > EPS) {
				const adjustment = pointsNum - totalPoints;

				//console.log(pointsNum, totalPoints);

				// Point Adjustment row
				const totalEventone = document.createElement("div");
				totalEventone.className = "ls-events subtotal";
				totalEventone.textContent = "Point Adjustment";
				eventsDiv.appendChild(totalEventone);

				const totalPtsone = document.createElement("div");
				totalPtsone.className = "ls-pts subtotal";
				totalPtsone.textContent = format_points(adjustment);
				ptsDiv.appendChild(totalPtsone);

				// Total Points row (show the displayed points, or format_points(pointsNum))
				const totalEvent = document.createElement("div");
				totalEvent.className = "ls-events subtotal";
				totalEvent.textContent = "Total Points";
				eventsDiv.appendChild(totalEvent);

				const totalPts = document.createElement("div");
				totalPts.className = "ls-pts subtotal";
				totalPts.textContent = format_points(pointsNum);
				ptsDiv.appendChild(totalPts);

			} else {
				// No adjustment needed; show totals
				const totalEvent = document.createElement("div");
				totalEvent.className = "ls-events subtotal";
				totalEvent.textContent = "Total Points";
				eventsDiv.appendChild(totalEvent);

				const totalPts = document.createElement("div");
				totalPts.className = "ls-pts subtotal";
				totalPts.textContent = format_points(totalPoints);
				ptsDiv.appendChild(totalPts);
			}
		}

		// Your proj diff logic unchanged...
		if (projpts !== "") {
			let projptsValue = 0;
			let pointsValue = 0;

			if (isPlaying) {
				pointsValue = parseFloat(pacePoints);
				projptsValue = parseFloat(projpts);
			} else if (isDone) {
				projptsValue = parseFloat(projpts);
				pointsValue = parseFloat(points);
			}

			if (!isNaN(projptsValue) && !isNaN(pointsValue)) {
				const difference = (pointsValue - projptsValue).toFixed(precision);

				if (isPlaying) {
					const originalProjDiv2 = document.createElement("div");
					originalProjDiv2.className = "ls-ppts hide-proj";
					originalProjDiv2.textContent = "Current Pace Pts";
					eventsDiv.appendChild(originalProjDiv2);

					const projptsDiv2 = document.createElement("div");
					projptsDiv2.className = "ls-ppts-pts hide-proj TEST";
					projptsDiv2.textContent = pacePoints;
					ptsDiv.appendChild(projptsDiv2);
				}

				const originalProjDiv = document.createElement("div");
				originalProjDiv.className = "ls-ppts hide-proj";
				originalProjDiv.textContent = "Original Proj";
				eventsDiv.appendChild(originalProjDiv);

				const differenceDiv = document.createElement("div");
				differenceDiv.className = "ls-ppts diff hide-proj";
				differenceDiv.textContent = "Difference";
				eventsDiv.appendChild(differenceDiv);

				const projptsDiv = document.createElement("div");
				projptsDiv.className = "ls-ppts-pts hide-proj";
				projptsDiv.textContent = projpts;
				ptsDiv.appendChild(projptsDiv);

				const diffPointsDiv = document.createElement("div");
				diffPointsDiv.className = `ls-ppts-pts diff-${difference > 0 ? "positive" : "negative"} hide-proj`;
				diffPointsDiv.textContent = difference > 0 ? `+${difference}` : difference;
				ptsDiv.appendChild(diffPointsDiv);
			}
		}

		if (hasLowPoints) {
			if (LSMteamBox) {
				LSMteamBox.innerHTML = "";
				LSMteamBox.appendChild(newTable);
				teamBoxOverlay.style.display = "block";
				LSMteamBox.classList.add("details");
				LSMteamBox.style.display = "block";

				try {
					bodyScrollLock.disableBodyScroll(LSMteamBox);
				} catch (error) {
					console.error(error);
				}
			}
		} else {
			alert("No stats");
		}

		return; // âœ… IMPORTANT: don't run fetch code too
	}

	const url = `${baseURLDynamic}/${year}/detailed?L=${league_id}&W=${real_ls_week}&P=${playerID}&PRINTER=1`;

	let projpts = 0;
	let pacePoints = 0;

	const scoreBox = liveScoreEl.parentElement; // .player-score-box
	const points = scoreBox?.querySelector(".player-live-score")?.textContent || "";

	if (isPlaying) {
		projpts = parseFloat(LSMplayerScoresByWeek?.[real_ls_week]?.[playerID]) || 0;
		pacePoints = scoreBox?.querySelector(".player-projected-score")?.textContent || "";
	} else if (isDone) {
		projpts = scoreBox?.querySelector(".player-projected-score")?.textContent || "";
	}

	const playerName =
		rowEl.querySelector(".player-details-box .player-name h3 a")?.textContent?.trim() ||
		rowEl.querySelector(".player-details-box .player-name a")?.textContent?.trim() ||
		"";

	const captionText = `Points Breakdown`;
	const pos = liveScoreEl.dataset.pos || null;
	const team = liveScoreEl.dataset.team || null;

	fetch(url)
		.then(response => {
			if (!response.ok) throw new Error("Network response was not ok");
			return response.text();
		})
		.then(data => {
			const parser = new DOMParser();
			const doc = parser.parseFromString(data, "text/html");

			const newTable = document.createElement("table");
			newTable.setAttribute("align", "center");
			newTable.setAttribute("cellspacing", "1");
			newTable.className = "report";
			newTable.innerHTML = `
				<caption>
					<div class="teamBox-caption-wrap">
						<div class="teamBox-caption-top">
							<span class="teamBox-caption-title">${captionText}</span>
							<i title="Close Boxscore" style="cursor:pointer;float:right" class="fa-solid fa-circle-xmark" onclick="removeTeamBox()"></i>
						</div>
					</div>
				</caption>
				<tbody>
					<tr><td>
						<div class="appendStats">
							<div class="appendStats-ls-events"></div>
							<div class="appendStats-ls-pts"></div>
						</div>
					</td></tr>
				</tbody>`;

			// optional: keep the player name header consistent with explain mode
			if (playerName) {
				const appendStats = newTable.querySelector(".appendStats");
				if (appendStats) {
					const nameDiv = document.createElement("div");
					nameDiv.className = "teamBox-caption-player";
					nameDiv.textContent = nameDiv.textContent = `${playerName}${pos ? " Â· " + pos : ""}${team ? " Â· " + team : ""}`;
					appendStats.parentNode.insertBefore(nameDiv, appendStats);
				}
			}

			let hasLowPoints = false;

			const eventsDiv = newTable.querySelector(".appendStats-ls-events");
			const ptsDiv = newTable.querySelector(".appendStats-ls-pts");

			doc.querySelectorAll("table.report tbody tr").forEach(row => {
				const pointsCell = row.querySelector("td.points");
				const ptsText = pointsCell?.textContent.trim() || "";

				const event = [...row.querySelectorAll("td")]
					.filter(td => !td.classList.contains("points") && !td.querySelector("a"))
					.map(td => td.textContent.trim())
					.join(" ");

				if (ptsText && event) {
					hasLowPoints = true;

					const eventElement = document.createElement("div");
					eventElement.className = "ls-events";
					eventElement.textContent = event;
					eventsDiv.appendChild(eventElement);

					const pointsElement = document.createElement("div");
					pointsElement.className = "ls-pts";
					pointsElement.textContent = ptsText;
					ptsDiv.appendChild(pointsElement);
				}
			});

			// Your proj diff logic unchanged...
			if (projpts !== "") {
				let projptsValue = 0;
				let pointsValue = 0;

				if (isPlaying) {
					pointsValue = parseFloat(pacePoints);
					projptsValue = parseFloat(projpts);
				} else if (isDone) {
					projptsValue = parseFloat(projpts);
					pointsValue = parseFloat(points);
				}

				if (!isNaN(projptsValue) && !isNaN(pointsValue)) {
					const difference = (pointsValue - projptsValue).toFixed(precision);

					if (isPlaying) {
						const originalProjDiv2 = document.createElement("div");
						originalProjDiv2.className = "ls-ppts hide-proj";
						originalProjDiv2.textContent = "Current Pace Pts";
						eventsDiv.appendChild(originalProjDiv2);

						const projptsDiv2 = document.createElement("div");
						projptsDiv2.className = "ls-ppts-pts hide-proj TEST";
						projptsDiv2.textContent = pacePoints;
						ptsDiv.appendChild(projptsDiv2);
					}

					const originalProjDiv = document.createElement("div");
					originalProjDiv.className = "ls-ppts hide-proj";
					originalProjDiv.textContent = "Original Proj";
					eventsDiv.appendChild(originalProjDiv);

					const differenceDiv = document.createElement("div");
					differenceDiv.className = "ls-ppts diff hide-proj";
					differenceDiv.textContent = "Difference";
					eventsDiv.appendChild(differenceDiv);

					const projptsDiv = document.createElement("div");
					projptsDiv.className = "ls-ppts-pts hide-proj";
					projptsDiv.textContent = projpts;
					ptsDiv.appendChild(projptsDiv);

					const diffPointsDiv = document.createElement("div");
					diffPointsDiv.className = `ls-ppts-pts diff-${difference > 0 ? "positive" : "negative"} hide-proj`;
					diffPointsDiv.textContent = difference > 0 ? `+${difference}` : difference;
					ptsDiv.appendChild(diffPointsDiv);
				}
			}

			if (hasLowPoints) {
				if (LSMteamBox) {
					LSMteamBox.innerHTML = "";
					LSMteamBox.appendChild(newTable);
					teamBoxOverlay.style.display = "block";
					LSMteamBox.classList.add("details");
					LSMteamBox.style.display = "block";

					try {
						bodyScrollLock.disableBodyScroll(LSMteamBox);
					} catch (error) {
						console.error(error);
					}
				}
			} else {
				alert("No stats");
			}
		})
		.catch(error => {
			console.error("Error fetching data for playerID " + playerID + ": ", error);
		});
});

// REMOVE NFL MATCHUP DETAILS POPUP BOX //
function removeTeamBox() {
	if (teamBoxOverlay) {
		teamBoxOverlay.style.display = 'none';
	}

	if (LSMteamBox) {
		LSMteamBox.style.display = 'none'; // Hide the team box
		LSMteamBox.innerHTML = ''; // Clear the team box content
	}

	try {
		bodyScrollLock.clearAllBodyScrollLocks();
	} catch (error) {
		console.error(error);
	}
}

// FORMAT PLAYERS NAMES //
function formatPlayerNameLSModule(name) {
	let nameSplit = name.split(",");
	if (nameSplit.length < 2) return name;
	return nameSplit[1] + " " + nameSplit[0];
}

function ensureRowContainers(container, rowTotal) {
	const existing = container.querySelectorAll('.matchupRow');
	const have = existing.length;

	// add missing
	for (let i = have; i < rowTotal; i++) {
		const row = document.createElement('div');
		row.className = 'matchupRow';

		const track = document.createElement('div');
		track.className = 'matchupRow-track';

		row.appendChild(track);
		container.appendChild(row);
	}

	// remove extra
	for (let i = have - 1; i >= rowTotal; i--) {
		existing[i].remove();
	}
}

function layoutIntoRows(container, boxes, rowCount) {
	const total = boxes.length;
	const rows = rowCount > 0 ? Math.ceil(total / rowCount) : 0;

	ensureRowContainers(container, rows);

	const tracks = Array.from(container.querySelectorAll('.matchupRow-track'));
	tracks.forEach(t => (t.innerHTML = ''));

	boxes.forEach((box, idx) => {
		const rowIndex = Math.floor(idx / rowCount);
		tracks[rowIndex].appendChild(box);
	});
}

/* =========================================================
   LSM Matchup Builder + Update-Only Refresher (Drop-in File)
   ---------------------------------------------------------
   Purpose:
   - Build matchup DOM ONCE (static appearance blocks built once)
   - Every 20 seconds: update only text + classes (no rebuild)

   REQUIREMENTS (expected globals you already have):
   - LSMmatchupBox: DOM element container
   - LSMLiveScoring: data object (either {matchup: []} or {franchise: []})
   - franchiseDatabase: object keyed like "fid_1234"
   - layoutIntoRows(container, boxes, rowCount): your existing function
   - rowCount: number (rows)
   - LSMmatchupIndex: current active matchup index
   - real_ls_week, startWeek, endWeek, completedWeek, currentWeekLSModule, etc. (as used)
   - flags: LSMfutureWeek, LSMpreviousWeek, LSMcurrentWeek
   - options: lsUseProjections, lsAppearanceBox, lsm_hideTeamsNoPlayers
   ========================================================= */

/* -----------------------
   DOM Cache (global)
------------------------ */
let LSMmatchupDomCache = null;

function cacheKey(matchupIndex, franchiseId) {
	return `${matchupIndex}::${franchiseId}`;
}

/* =========================================================
   PUBLIC API
   ========================================================= */

/**
 * Call this on:
 * - page load
 * - week change
 * - rowCount change
 * - toggle lsm_hideTeamsNoPlayers change
 * - any time the matchup LIST changes
 */
function LSMbuildMatchupsInitial() {
	try {
		if (real_ls_week > endWeek || startWeek > real_ls_week) {
			LSMLiveScoring = [];
			if (LSMmatchupBox) LSMmatchupBox.innerHTML = "";
			LSMmatchupDomCache = null;
			return;
		}

		if (!LSMmatchupBox) return;

		// Clear container once
		LSMmatchupBox.innerHTML = "";

		const cache = {
			mode: null, // "matchup" | "franchise"
			matchupEls: new Map(), // matchupIndex -> matchupBoxScroll element
			franchiseEls: new Map(), // matchupIndex::franchiseId -> { rowEl, scoreEl, ppEl, winnerEl }
			// for single-match mode indexing stability:
			renderedSingleOrder: [] // [{idx, id}] where idx is orderCounter
		};

		const builtBoxes = [];

		// -----------------------------------------
		// CASE 1: matchup[] mode
		// -----------------------------------------
		if (LSMLiveScoring?.matchup && Array.isArray(LSMLiveScoring.matchup)) {
			cache.mode = "matchup";

			for (let m = 0; m < LSMLiveScoring.matchup.length; m++) {
				const matchup = LSMLiveScoring.matchup[m];

				const matchupBoxScroll = document.createElement("div");
				matchupBoxScroll.title = "View Matchup";
				matchupBoxScroll.dataset.number = String(m);
				matchupBoxScroll.id = "matchup_swap_" + m;

				applyMatchupClasses(matchupBoxScroll, matchup, m);

				cache.matchupEls.set(m, matchupBoxScroll);

				const frs = matchup?.franchise;
				if (Array.isArray(frs)) {
					for (let f = 0; f < frs.length; f++) {
						const franchise = frs[f];
						const franchiseInfo = franchiseDatabase?.["fid_" + franchise.id];

						const franchiseBoxScroll = document.createElement("div");
						franchiseBoxScroll.dataset.franchise = franchise.id;
						franchiseBoxScroll.id = "franchise_" + franchise.id;

						applyFranchiseClasses(franchiseBoxScroll, franchise);

						const built = buildFranchiseRowDom({
							franchise,
							franchiseInfo,
							matchupBoxScroll
						});

						// Append fragment
						franchiseBoxScroll.appendChild(built.frag);

						// Cache dynamic elements
						cache.franchiseEls.set(cacheKey(m, franchise.id), {
							rowEl: franchiseBoxScroll,
							scoreEl: built.scoreEl || null,
							ppEl: built.ppEl || null,
							winnerEl: built.winnerEl || null
						});

						matchupBoxScroll.appendChild(franchiseBoxScroll);
					}
				}

				builtBoxes.push(matchupBoxScroll);
			}
		}

		// -----------------------------------------
		// CASE 2: franchise[] mode (single-match)
		// -----------------------------------------
		else if (LSMLiveScoring?.franchise && Array.isArray(LSMLiveScoring.franchise)) {
			cache.mode = "franchise";

			let orderCounter = 0;

			for (let i = 0; i < LSMLiveScoring.franchise.length; i++) {
				const franchise = LSMLiveScoring.franchise[i];

				// respect your hide rule
				if (lsm_hideTeamsNoPlayers && franchise.players.player.length === 0) {
					continue;
				}

				const matchupBoxScroll = document.createElement("div");
				matchupBoxScroll.title = "View Matchup";
				matchupBoxScroll.dataset.number = String(orderCounter);
				matchupBoxScroll.id = "matchup_swap_" + orderCounter;

				applySingleMatchupClasses(matchupBoxScroll, franchise, orderCounter);

				cache.matchupEls.set(orderCounter, matchupBoxScroll);

				const franchiseInfo = franchiseDatabase?.["fid_" + franchise.id];

				const franchiseBoxScroll = document.createElement("div");
				franchiseBoxScroll.dataset.franchise = franchise.id;
				franchiseBoxScroll.id = "franchise_" + franchise.id;

				applyFranchiseClassesSingle(franchiseBoxScroll, franchise, matchupBoxScroll);

				const built = buildFranchiseRowDom({
					franchise,
					franchiseInfo,
					matchupBoxScroll
				});

				franchiseBoxScroll.appendChild(built.frag);

				cache.franchiseEls.set(cacheKey(orderCounter, franchise.id), {
					rowEl: franchiseBoxScroll,
					scoreEl: built.scoreEl || null,
					ppEl: built.ppEl || null,
					winnerEl: built.winnerEl || null
				});

				matchupBoxScroll.appendChild(franchiseBoxScroll);
				builtBoxes.push(matchupBoxScroll);

				cache.renderedSingleOrder.push({
					idx: orderCounter,
					id: franchise.id
				});

				orderCounter++;
			}
		}

		// -----------------------------------------
		// Layout once
		// -----------------------------------------
		const total = builtBoxes.length;
		const safeRowCount = Math.max(1, Math.min(Number(rowCount) || 1, total || 1));

		if (typeof layoutIntoRows === "function") {
			layoutIntoRows(LSMmatchupBox, builtBoxes, safeRowCount);
		} else {
			// fallback: just append
			builtBoxes.forEach(b => LSMmatchupBox.appendChild(b));
		}

		// Save cache
		LSMmatchupDomCache = cache;

		// Paint dynamic fields once immediately
		LSMupdateMatchupsOnly();

		LSM_activateAndScrollMatchup(LSMmatchupIndex);

	} catch (err) {
		// fail-safe: do not break other scripts
		// console.error("LSMbuildMatchupsInitial error:", err);
	}
}

/**
 * Call this every 20 seconds during live games.
 * It updates:
 * - matchup classes (done/active)
 * - franchise classes (win/tie/teamOver)
 * - score text
 * - projection text/class (pproj_higher/lower/original-projection)
 */
function LSMupdateMatchupsOnly() {
	try {
		const cache = LSMmatchupDomCache;
		if (!cache) return;

		// ---------------------------
		// matchup[] mode
		// ---------------------------
		if (cache.mode === "matchup" && Array.isArray(LSMLiveScoring?.matchup)) {

			// collect ALL AVG matchups while looping
			const avgJobs = []; // [{ m, frs }]

			for (let m = 0; m < LSMLiveScoring.matchup.length; m++) {
				const matchup = LSMLiveScoring.matchup[m];

				const matchupEl = cache.matchupEls.get(m);
				if (matchupEl) applyMatchupClasses(matchupEl, matchup, m);

				const frs = matchup?.franchise;
				if (!Array.isArray(frs)) continue;

				for (let f = 0; f < frs.length; f++) {
					const franchise = frs[f];
					const entry = cache.franchiseEls.get(cacheKey(m, franchise.id));
					if (!entry) continue;

					applyFranchiseClasses(entry.rowEl, franchise);

					if (entry.scoreEl) entry.scoreEl.textContent = franchise.score ?? "";
					if (entry.ppEl) updateProjectionCell(entry.ppEl, franchise);
				}

				// queue this matchup if it contains AVG
				if (frs.some(fr => fr?.id === "AVG")) {
					avgJobs.push({
						m,
						frs
					});
				}
			}

			// run AVG comparisons AFTER the loop
			for (let i = 0; i < avgJobs.length; i++) {
				applyAvgWinnerClassesForMatchup(avgJobs[i].m, avgJobs[i].frs);
			}

			return;
		}

		// ---------------------------
		// franchise[] single-match mode
		// Uses renderedSingleOrder to keep indexes stable
		// ---------------------------
		if (cache.mode === "franchise" && Array.isArray(LSMLiveScoring?.franchise)) {
			// Build lookup from id -> data
			const byId = new Map();
			for (const fr of LSMLiveScoring.franchise) byId.set(fr.id, fr);

			for (const item of cache.renderedSingleOrder) {
				const idx = item.idx;
				const id = item.id;

				const franchise = byId.get(id);
				if (!franchise) continue;

				const matchupEl = cache.matchupEls.get(idx);
				if (matchupEl) applySingleMatchupClasses(matchupEl, franchise, idx);

				const entry = cache.franchiseEls.get(cacheKey(idx, id));
				if (!entry) continue;

				applyFranchiseClassesSingle(entry.rowEl, franchise, matchupEl);

				if (entry.scoreEl) entry.scoreEl.textContent = franchise.score ?? "";
				if (entry.ppEl) updateProjectionCell(entry.ppEl, franchise);
			}

			return;
		}
	} catch (err) {
		// console.error("LSMupdateMatchupsOnly error:", err);
	}
}

function applyAvgWinnerClassesForMatchup(matchupIndex, franchiseArray) {
	if (!Array.isArray(franchiseArray) || franchiseArray.length < 2) return;
	if (!LSMmatchupDomCache) return;

	// find AVG and the "other" franchise in the matchup
	const avg = franchiseArray.find(fr => fr?.id === "AVG");
	if (!avg) return;

	// pick the first non-AVG/non-BYE as opponent
	const opp = franchiseArray.find(fr => fr?.id !== "AVG" && fr?.id !== "BYE");
	if (!opp) return;

	const avgScore = parseFloat(avg.score);
	const oppScore = parseFloat(opp.score);

	if (!Number.isFinite(avgScore) || !Number.isFinite(oppScore)) return;

	const avgEntry = LSMmatchupDomCache.franchiseEls.get(cacheKey(matchupIndex, "AVG"));
	const oppEntry = LSMmatchupDomCache.franchiseEls.get(cacheKey(matchupIndex, opp.id));

	if (!avgEntry?.rowEl || !oppEntry?.rowEl) return;

	// clear previous winner state (only what we control)
	avgEntry.rowEl.classList.remove("greater-score");
	oppEntry.rowEl.classList.remove("greater-score");

	// apply winner
	if (avgScore > oppScore) {
		avgEntry.rowEl.classList.add("greater-score");
	} else if (oppScore > avgScore) {
		oppEntry.rowEl.classList.add("greater-score");
	} else {
		avgEntry.rowEl.classList.add("tie-score");
	}
}

/* =========================================================
   BUILD HELPERS
   ========================================================= */

function buildFranchiseRowDom({
	franchise,
	franchiseInfo,
	matchupBoxScroll
}) {
	const frag = document.createDocumentFragment();

	let scoreEl = null;
	let ppEl = null;
	let winnerEl = null;

	// BYE
	if (franchise.id === "BYE") {
		matchupBoxScroll?.classList?.add("bye-matchup", "single-matchup");

		const name = document.createElement("div");
		name.className = "franchise-name-scroll";
		name.innerHTML = "<h2>Bye Week</h2>";
		frag.appendChild(name);

		scoreEl = document.createElement("div");
		scoreEl.className = "franchise-score-scroll score_BYE";
		scoreEl.textContent = "";
		frag.appendChild(scoreEl);

		return {
			frag,
			scoreEl,
			ppEl,
			winnerEl
		};
	}

	// AVG
	if (franchise.id === "AVG") {
		matchupBoxScroll?.classList?.add("avg-matchup");

		const name = document.createElement("div");
		name.className = "franchise-name-scroll";
		name.innerHTML = "<h2>vs Average</h2>";
		frag.appendChild(name);

		scoreEl = document.createElement("div");
		scoreEl.className = "franchise-score-scroll score_AVG";
		scoreEl.textContent = franchise.score ?? "";
		frag.appendChild(scoreEl);

		// âœ… add winner mark for AVG (requested)
		if (LSMpreviousWeek || LSMcurrentWeek) {
			winnerEl = document.createElement("div");
			winnerEl.className = "winnerMark";
			frag.appendChild(winnerEl);
		}

		return {
			frag,
			scoreEl,
			ppEl,
			winnerEl
		};
	}


	// STATIC appearance (built once, never updated)
	const appearanceNode = buildAppearanceBlock(franchiseInfo);
	if (appearanceNode) frag.appendChild(appearanceNode);

	// Projection cell exists (dynamic contents)
	if (lsUseProjections && (LSMcurrentWeek || LSMpreviousWeek)) {
		ppEl = document.createElement("div");
		ppEl.className = "franchise-pp-scroll";
		ppEl.textContent = "";
		frag.appendChild(ppEl);
	}

	// Score cell (dynamic)
	scoreEl = document.createElement("div");
	scoreEl.className = `franchise-score-scroll score_${franchise.id}`;
	scoreEl.textContent = franchise.score ?? "";
	frag.appendChild(scoreEl);

	// Winner mark exists (mostly static existence)
	if ((LSMpreviousWeek || LSMcurrentWeek) && franchise.id !== "BYE") {
		winnerEl = document.createElement("div");
		winnerEl.className = "winnerMark";
		frag.appendChild(winnerEl);
	}

	return {
		frag,
		scoreEl,
		ppEl,
		winnerEl
	};
}

function buildAppearanceBlock(franchiseInfo) {
	// keep exactly your options; build once
	if (!lsAppearanceBox || lsAppearanceBox === 0) return null;

	if (lsAppearanceBox === 1) {
		const d = document.createElement("div");
		d.className = "franchise-icon-scroll";
		const img = document.createElement("img");
		img.src = (franchiseInfo && franchiseInfo.icon) ? franchiseInfo.icon : "";
		img.alt = (franchiseInfo && franchiseInfo.name) ? franchiseInfo.name : "";
		d.appendChild(img);
		return d;
	}

	if (lsAppearanceBox === 2) {
		const d = document.createElement("div");
		d.className = "franchise-name-scroll";
		d.innerHTML = `<h2>${(franchiseInfo && franchiseInfo.name) ? franchiseInfo.name : ""}</h2>`;
		return d;
	}

	if (lsAppearanceBox === 3) {
		const d = document.createElement("div");
		d.className = "franchise-name-scroll";
		d.innerHTML = `<h2>${(franchiseInfo && franchiseInfo.abbrev) ? franchiseInfo.abbrev : ""}</h2>`;
		return d;
	}

	if (lsAppearanceBox === 5) {
		const d = document.createElement("div");
		d.className = "franchise-icon-scroll";
		const img = document.createElement("img");
		img.src = franchiseInfo?.logo || "";
		img.alt = franchiseInfo?.name || "";
		d.appendChild(img);
		return d;
	}

	// 4,6,7: ignore like you do
	return null;
}

/* =========================================================
   UPDATE HELPERS
   ========================================================= */

function updateProjectionCell(ppEl, franchise) {
	if (!ppEl) return;

	// reset controlled classes
	ppEl.classList.remove("pproj_higher", "pproj_lower", "original-projection");
	ppEl.textContent = "";

	// Match your current week behavior (adjust if you want previousWeek projections too)
	if (!(lsUseProjections && LSMcurrentWeek)) return;

	const gsr = Number(franchise?.gameSecondsRemaining);
	const pace = parseFloat(franchise?.starterPaceTot);
	const proj = parseFloat(franchise?.starterProjTot);

	if (!Number.isFinite(gsr) || !Number.isFinite(pace) || !Number.isFinite(proj)) return;

	if (gsr > 0) {
		ppEl.textContent = String(franchise.starterPaceTot ?? "");

		if (pace > proj) ppEl.classList.add("pproj_higher");
		else if (pace < proj) ppEl.classList.add("pproj_lower");
		else ppEl.classList.add("original-projection");
	} else {
		ppEl.textContent = String(franchise.starterProjTot ?? "");
		ppEl.classList.add("original-projection");
	}
}

/* =========================================================
   CLASS LOGIC (pulled from your code)
   ========================================================= */

function applyMatchupClasses(matchupBoxScroll, matchup, matchupIndex) {
	if (!matchupBoxScroll) return;

	// Recompute exactly like your build does
	if (LSMfutureWeek) {
		matchupBoxScroll.className = "matchup-box-scroll" + (matchupIndex === LSMmatchupIndex ? " active" : "");
		return;
	}

	if (LSMpreviousWeek) {
		matchupBoxScroll.className = "matchupIsOver matchup-box-scroll" + (matchupIndex === LSMmatchupIndex ? " active" : "");
		return;
	}

	if (LSMcurrentWeek) {
		const allDone = matchup?.franchise?.every(fr => fr.gameStatus === "done");
		matchupBoxScroll.className =
			(allDone ? "matchupIsOver " : "") +
			"matchup-box-scroll" +
			(matchupIndex === LSMmatchupIndex ? " active" : "");
	}
}

function applyFranchiseClasses(franchiseBoxScroll, franchise) {
	if (!franchiseBoxScroll) return;

	// Use your existing logic
	if (LSMcurrentWeek || LSMpreviousWeek) {
		if (franchise.gameStatus === "done") {
			if (franchise.result === "win") {
				franchiseBoxScroll.className = "teamOver greater-score franchise-box-scroll franchiseBox_" + franchise.id;
			} else if (franchise.result === "tie" && (franchise.id !== "BYE" && franchise.id !== "AVG")) {
				franchiseBoxScroll.className = "teamOver tie-score franchise-box-scroll franchiseBox_" + franchise.id;
			} else {
				franchiseBoxScroll.className = "teamOver franchise-box-scroll franchiseBox_" + franchise.id;
			}
		} else {
			franchiseBoxScroll.className = "franchise-box-scroll franchiseBox_" + franchise.id;
		}
	}

	if (LSMfutureWeek) {
		franchiseBoxScroll.className = "franchise-box-scroll franchiseBox_" + franchise.id;
	}
}

function applySingleMatchupClasses(matchupBoxScroll, franchise, orderCounter) {
	if (!matchupBoxScroll) return;

	matchupBoxScroll.className =
		(LSMpreviousWeek ? "matchupIsOver " : "") +
		"matchup-box-scroll" +
		(orderCounter === LSMmatchupIndex ? " active" : "");

	if (LSMcurrentWeek) {
		if (franchise.gameStatus === "done") {
			matchupBoxScroll.classList.add("matchupIsOver");
		} else {
			matchupBoxScroll.classList.remove("matchupIsOver");
		}
	}
}

function applyFranchiseClassesSingle(franchiseBoxScroll, franchise, matchupBoxScroll) {
	if (!franchiseBoxScroll) return;

	// Your original single-match class logic condensed
	if (LSMfutureWeek || LSMcurrentWeek) {
		franchiseBoxScroll.className = "franchise-box-scroll singleMatch franchiseBox_" + franchise.id;
	}

	if (LSMpreviousWeek) {
		franchiseBoxScroll.className = "teamOver greater-score franchise-box-scroll singleMatch franchiseBox_" + franchise.id;
	}

	if (LSMcurrentWeek) {
		if (franchise.gameStatus === "done") {
			franchiseBoxScroll.className = "franchise-box-scroll teamOver greater-score singleMatch franchiseBox_" + franchise.id;
			matchupBoxScroll?.classList?.add("matchupIsOver");
		} else {
			franchiseBoxScroll.className = "franchise-box-scroll singleMatch franchiseBox_" + franchise.id;
		}
	}
}

/* =========================================================
   OPTIONAL: tiny helpers to decide when to rebuild
   ========================================================= */

/**
 * If you want a simple rule:
 * - If number of matchups/franchises changed, rebuild
 * - Else update-only
 */
function LSMshouldRebuildMatchups() {
	const cache = LSMmatchupDomCache;
	if (!cache) return true;

	if (cache.mode === "matchup") {
		const currentLen = Array.isArray(LSMLiveScoring?.matchup) ? LSMLiveScoring.matchup.length : -1;
		return cache.matchupEls.size !== currentLen;
	}

	if (cache.mode === "franchise") {
		// In franchise mode we track rendered order length
		// If hide rule changes or list changes, rebuild
		const currentVisible = Array.isArray(LSMLiveScoring?.franchise) ?
			LSMLiveScoring.franchise.filter(fr => !(lsm_hideTeamsNoPlayers && !(fr.players && fr.players.player))).length :
			-1;

		return cache.renderedSingleOrder.length !== currentVisible;
	}

	return true;
}

function LSM_activateAndScrollMatchup(idx) {
	idx = parseInt(idx, 10);
	if (!Number.isFinite(idx)) return;

	const element = document.getElementById("matchup_swap_" + idx);
	if (!element) return;

	// remove old active
	LSMmatchupBox.querySelectorAll(".matchup-box-scroll.active").forEach(a => a.classList.remove("active"));

	// add active
	element.classList.add("active");

	// scroll
	const container = element.closest(".matchupRow");
	if (container) {
		const targetScrollPosition = element.offsetLeft - container.offsetLeft;
		container.scrollLeft = targetScrollPosition;
	}
}

// CLICK EACH FRANCHISE MATCHUP //
document.addEventListener("click", function (e) {
	const clickedElement = e.target.closest(".matchup-box-scroll");
	if (!clickedElement) return;

	LSMmatchupIndex = parseInt(clickedElement.getAttribute("data-number"), 10);
	LSMbuildMatchupsPlayers(LSMmatchupIndex);

	LSM_activateAndScrollMatchup(LSMmatchupIndex);
});

// TOUCH MOVE FOR PLAYERS BOX MATCHUPS //
function getTouchesLSModule(evt) {
	return (
		evt.touches || // browser API
		evt.originalEvent.touches
	);
}

function handleTouchStartLSModule(evt) {
	const firstTouch = getTouchesLSModule(evt)[0];
	xDown = firstTouch.clientX;
	yDown = firstTouch.clientY;
}

function handleTouchMoveLSModule(evt) {
	if (!xDown || !yDown) {
		return;
	}

	const xUp = evt.touches[0].clientX;
	const yUp = evt.touches[0].clientY;

	const xDiff = xDown - xUp;
	const yDiff = yDown - yUp;

	// Determine swipe direction
	if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 70) {
		if (xDiff > 0) {
			LSMmatchupIndex = parseInt(LSMmatchupIndex, 10) + 1;
		} else {
			LSMmatchupIndex -= 1;
		}
	} else {
		return;
	}

	// Loop matchup index if it goes out of bounds
	if (LSMmatchupIndex >= totalMatchups) {
		LSMmatchupIndex = 0;
	} else if (LSMmatchupIndex < 0) {
		LSMmatchupIndex = totalMatchups - 1;
	}

	LSMbuildMatchupsPlayers(LSMmatchupIndex);

	// Remove 'active' class from currently active elements
	LSMmatchupBox.querySelectorAll('.matchup-box-scroll.active').forEach((activeElement) => {
		activeElement.classList.remove('active');
	});

	// Add 'active' class to the new active element
	const newActiveElement = document.getElementById("matchup_swap_" + LSMmatchupIndex);
	if (newActiveElement) {
		newActiveElement.classList.add('active');

		// Scroll container to the target element
		const container = newActiveElement.closest('.matchupRow');
		if (container) {
			const targetScrollPosition = newActiveElement.offsetLeft - container.offsetLeft;
			container.scrollLeft = targetScrollPosition;
		}
	}

	// Reset touch start positions
	xDown = null;
	yDown = null;
}


// PARSE LIVE STATS DATA FOR TEAMS //
function get_TEAMstats_str(pid, offense) {
	var groups = [];
	if (ls_tstats[pid] == undefined) {
		return "";
	}
	if (hasOwn(ls_tstats, pid)) {
		if (offense) {
			for (var i = 0; i < show_offStats.length; i++) {
				var stat = show_offStats[i];
				if (ls_tstats[pid][stat] != undefined && ls_tstats[pid][stat] != 0) {
					groups.push(ls_tstats[pid][stat] + " " + stat);
				}
			}
		} else {
			for (var i = 0; i < show_defStats.length; i++) {
				var stat = show_defStats[i];
				if (ls_tstats[pid][stat] != undefined && ls_tstats[pid][stat] != 0) {
					groups.push(ls_tstats[pid][stat] + " " + stat);
				}
			}
			if (ls_tstats[pid].FC > 0) {
				groups.push(ls_tstats[pid].FC + "&nbsp;FR");
				if (ls_tstats[pid]["#DR"] > 0) {
					groups.push(ls_tstats[pid]["#DR"] + "&nbsp;FR&nbsp;TD&nbsp;(" + ls_tstats[pid].DR + ")");
				}
			}
			if (ls_tstats[pid].IC > 0) {
				groups.push(ls_tstats[pid].IC + "&nbsp;Int");
				if (ls_tstats[pid]["#IR"] > 0) {
					groups.push(ls_tstats[pid]["#IR"] + "&nbsp;Int&nbsp;TD&nbsp;(" + ls_tstats[pid].IR + ")");
				}
			}
			if (ls_tstats[pid]["#KT"] > 0) {
				groups.push(ls_tstats[pid]["#KT"] + "&nbsp;KTD&nbsp;(" + ls_tstats[pid].KO + ")");
			}
			if (ls_tstats[pid]["#UT"] > 0) {
				groups.push(ls_tstats[pid]["#UT"] + "&nbsp;PTD&nbsp;(" + ls_tstats[pid].PR + ")");
			}
			if (ls_tstats[pid].BLF > 0) {
				groups.push(ls_tstats[pid].BLF + "&nbsp;BLF");
				if (ls_tstats[pid]["#BF"] > 0) {
					groups.push(ls_tstats[pid]["#BF"] + "&nbsp;BF&nbsp;(" + ls_tstats[pid].BF + ")");
				}
			}
			if (ls_tstats[pid].BLP > 0) {
				groups.push(ls_tstats[pid].BLP + "&nbsp;BLP");
				if (ls_tstats[pid]["#BP"] > 0) {
					groups.push(ls_tstats[pid]["#BP"] + "&nbsp;BP&nbsp;(" + ls_tstats[pid].BP + ")");
				}
			}
			if (ls_tstats[pid].BLE > 0) {
				groups.push(ls_tstats[pid].BLE + "&nbsp;BLE");
			}
		}
		var statStr = groups.join("; ");
		if (statStr === "") statStr = "no stats";
		return statStr;
	}
}


// PARSE LIVE STATS DATA FOR PLAYERS //
function doLSMBoxLiveStats(pid) {
	var groups = [];
	if (ls_stats[pid] == undefined) {
		return "";
	}
	if (ls_stats[pid].PA > 0) {
		var subgr = [];
		if (ls_stats[pid].PC === undefined) {
			ls_stats[pid].PC = 0;
		}
		if (ls_stats[pid].PY === undefined) {
			ls_stats[pid].PY = 0;
		}
		subgr.push("Pass: " + ls_stats[pid].PC + "-" + ls_stats[pid].PA + "-" + ls_stats[pid].PY);
		if (ls_stats[pid]["#P"] > 0) {
			subgr.push(ls_stats[pid]["#P"] + " PaTD (" + ls_stats[pid].PS + ")");
		}
		if (ls_stats[pid].IN > 0) {
			subgr.push(ls_stats[pid].IN + " Int");
		}
		if (ls_stats[pid]["P2"] > 0) {
			subgr.push(ls_stats[pid]["P2"] + " Pa2P");
		}
		groups.push(subgr.join(", "));
	}
	if (ls_stats[pid].RA > 0) {
		var subgr = [];
		if (ls_stats[pid].RY === undefined) {
			ls_stats[pid].RY = 0;
		}
		subgr.push("Rush: " + ls_stats[pid].RA + "-" + ls_stats[pid].RY);
		if (ls_stats[pid]["#R"] > 0) {
			subgr.push(ls_stats[pid]["#R"] + " RuTD (" + ls_stats[pid].RS + ")");
		}
		if (ls_stats[pid]["R2"] > 0) {
			subgr.push(ls_stats[pid]["R2"] + " Ru2P");
		}
		groups.push(subgr.join(", "));
	}
	if (ls_stats[pid].CC > 0) {
		var subgr = [];
		if (ls_stats[pid].CY === undefined) {
			ls_stats[pid].CY = 0;
		}
		subgr.push("Rec: " + ls_stats[pid].CC + "-" + ls_stats[pid].CY);
		if (ls_stats[pid]["#C"] > 0) {
			subgr.push(ls_stats[pid]["#C"] + " ReTD (" + ls_stats[pid].RC + ")");
		}
		if (ls_stats[pid]["C2"] > 0) {
			subgr.push(ls_stats[pid]["C2"] + " Re2P");
		}
		groups.push(subgr.join(", "));
	}
	if (ls_stats[pid].FL > 0) {
		groups.push(ls_stats[pid].FL + " Fum Lost");
	}
	if (ls_stats[pid].TK > 0 || ls_stats[pid].AS > 0 || ls_stats[pid].PD > 0) {
		var subgr = [];
		if (ls_stats[pid].TK > 0) {
			subgr.push(ls_stats[pid].TK + " T");
		}
		if (ls_stats[pid].TFL > 0) {
			subgr.push(ls_stats[pid].TKL + " TFL");
		}
		if (ls_stats[pid].AS > 0) {
			subgr.push(ls_stats[pid].AS + " A");
		}
		if (ls_stats[pid].SK > 0) {
			subgr.push(ls_stats[pid].SK + " SK");
		}
		if (ls_stats[pid].PD > 0) {
			subgr.push(ls_stats[pid].PD + " PD");
		}
		if (ls_stats[pid].IC > 0) {
			var str = ls_stats[pid].IC + " INT";
			if (ls_stats[pid]["#IR"] > 0) {
				str = str + " " + ls_stats[pid]["#IR"] + " IntTD (" + ls_stats[pid].IR + ")";
			}
			subgr.push(str);
		}
		if (ls_stats[pid].FF > 0) {
			subgr.push(ls_stats[pid].FF + " FF");
		}
		if (ls_stats[pid].FC > 0) {
			var str = ls_stats[pid].FC + " FR";
			if (ls_stats[pid]["#DR"] > 0) {
				str = str + " " + ls_stats[pid]["#DR"] + " FRTD (" + ls_stats[pid].DR + ")";
			}
			subgr.push(str);
		}
		groups.push(subgr.join(", "));
	}
	if (ls_stats[pid]["#A"] > 0 || ls_stats[pid].EA > 0) {
		var subgr = [];
		var str = "Kick: ";
		if (ls_stats[pid]["#A"] > 0) {
			var dist = "";
			if (ls_stats[pid]["#F"] === undefined) {
				ls_stats[pid]["#F"] = 0;
			}
			if (ls_stats[pid].FG !== undefined) {
				dist = "(" + ls_stats[pid].FG + ")";
			}
			subgr.push(str + ls_stats[pid]["#F"] + "-" + ls_stats[pid]["#A"] + " FG " + dist);
			str = "";
		}
		if (ls_stats[pid].EA > 0) {
			if (ls_stats[pid].EP === undefined) {
				ls_stats[pid].EP = 0;
			}
			subgr.push(str + ls_stats[pid].EP + "-" + ls_stats[pid].EA + " XP");
			str = "";
		}
		groups.push(subgr.join(", "));
	}
	var statStr = groups.join("; ");
	if (statStr === "") statStr = "no stats";
	return statStr;
}


// LOAD PLAYER FANTASY MATCHUPS //
async function LSMbuildMatchupsPlayers(LSMmatchupIndex) {
	if (real_ls_week > endWeek || startWeek > real_ls_week) {
		LSMLiveScoring = [];
		return;
	}
	const parts = [];
	var showInjury = false;
	if (currentWeekLSModule > real_ls_week || completedWeek > endWeek || completedWeek === endWeek) {
		showInjury = false;
	} else {
		showInjury = true;
		injuryArray = reportInjuries_ar.injuries && reportInjuries_ar.injuries.injury ? reportInjuries_ar.injuries.injury : [];
	}
	let fidToRecordMap = {};
	for (let standings of reportStandings_ar) {
		fidToRecordMap[standings.fid] = standings.record;
	}
	const nflByeWeekByTeam = Object.create(null);

	// âœ… correct path
	const byeTeams = reportNflByeWeeks_ar?.nflByeWeeks?.team;

	if (Array.isArray(byeTeams)) {
		for (const t of byeTeams) {
			const id = t?.id;
			const bw = t?.bye_week;
			if (id && bw != null) {
				nflByeWeekByTeam[String(id).trim().toUpperCase()] = Number(bw);
			}
		}
	}

	const realWeekNum = Number(real_ls_week);
	if (LSMLiveScoring.matchup) {
		for (m in LSMLiveScoring.matchup) {
			m = parseInt(m, 10);
			if (m === LSMmatchupIndex) {
				let allFranchisesDone = LSMLiveScoring.matchup[m].franchise.every(franchise => franchise.gameStatus === 'done');
				let matchupBoxClass = 'matchup-box head-to-head';
				if (allFranchisesDone) {
					matchupBoxClass += ' matchupOver';
				}
				if (LSMLiveScoring.matchup[m].franchise.some(franchise => franchise.id === "BYE")) {
					matchupBoxClass = 'matchup-box bye-matchup single-matchup';
				} else if (LSMLiveScoring.matchup[m].franchise.some(franchise => franchise.id === "AVG")) {
					matchupBoxClass = 'matchup-box avg-matchup single-matchup';
				}
				parts.push(`<div id="matchup_${m}" class="${matchupBoxClass}">`);
				for (f in LSMLiveScoring.matchup[m].franchise) {
					let franchise = LSMLiveScoring.matchup[m].franchise[f];
					let franchiseInfo = franchiseDatabase["fid_" + franchise.id];
					let franchiseBoxClass = 'franchise-box';
					let totalStarters = 0;
					let totalNonStarters = 0;
					let rowCounterStarters = 1;
					let rowCounterBench = 1;
					if (franchise.isHome === "1") {
						franchiseBoxClass += ' teamHome';
					} else if (franchise.isHome === "0") {
						franchiseBoxClass += ' teamAway';
					}
					if (franchise.id === "BYE" || franchise.id === "AVG") {
						// do not build players containers for bye or avg franchises
					} else {
						const playerList = franchise?.players?.player || [];

						for (const playerScore of playerList) {
							if (!playerScore?.id) continue;

							if (playerScore.status === "starter") totalStarters++;
							if (playerScore.status === "nonstarter") totalNonStarters++;
						}
						if (!playerList.length) {
							console.warn("No players for franchise", franchise?.id);
						}
						parts.push(`<div id="franchise_${franchise.id}" class="${franchiseBoxClass}">`);
						parts.push(`<div class="scoresContainer">`); // open div.scoresContainer
						if (lsAppearance === 0) {
							parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.icon ? franchiseInfo.icon : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}</a></h2></div>`);
						} else if (lsAppearance === 1) {
							parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.icon ? franchiseInfo.icon : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div>`);
						} else if (lsAppearance === 2) {
							parts.push(`<div class="franchise-name"><h2><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}</a></h2></div>`);
						} else if (lsAppearance === 3) {
							parts.push(`<div class="franchise-name"><h2><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.abbrev ? franchiseInfo.abbrev : ''}</a></h2></div>`);
						} else if (lsAppearance === 4) {
							parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.icon ? franchiseInfo.icon : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.abbrev ? franchiseInfo.abbrev : ''}</a></h2></div>`);
						} else if (lsAppearance === 5) {
							parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.logo ? franchiseInfo.logo : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div>`);
						} else if (lsAppearance === 6) {
							parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.logo ? franchiseInfo.logo : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}</a></h2></div>`);
						} else if (lsAppearance === 7) {
							parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.logo ? franchiseInfo.logo : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.abbrev ? franchiseInfo.abbrev : ''}</a></h2></div>`);
						}
						if (fidToRecordMap[franchise.id] !== "NaN-NaN-NaN") {
							parts.push(`<div class="franchise-record" style="padding:.1rem">${fidToRecordMap[franchise.id]}</div>`);
						}


						// add class to winprob_home , greaterthan and lessthan , depending on which team has higher ${franchise.winProb} , if both teams are equal then add class greaterthan

						if (franchise.isHome === "1" && lsm_use_probability && LSMcurrentWeek) {
							parts.push(`<div class="LS_HomeTeamPercent win_percentage" style="margin-bottom: 0.175rem;"><span class="win_percentage_bar" style="position:relative;display:block"><div class="winprob_home ${franchise.winProbClass}" style="width: ${franchise.winProb};">${franchise.winProb}</div></span></div>`);
						} else if (franchise.isHome === "0" && lsm_use_probability && LSMcurrentWeek) {
							parts.push(`<div class="LS_AwayTeamPercent win_percentage" style="margin-bottom: 0.175rem;"><span class="win_percentage_bar" style="position:relative;display:block"><div class="winprob_away ${franchise.winProbClass}" style="width: ${franchise.winProb};">${franchise.winProb}</div></span></div>`);
						}


						if (LSMcurrentWeek && lsmPMR) {
							parts.push(`<div class="franchise-pmr-wrap pmr_${franchise.id}" style="margin-bottom:0.175rem;padding:0.275rem;text-align:center"><div class="players-pmr-wrap" style="display:inline-flex;width:100%"><div class="players-playing" style="text-align:center;width:33.3%">P</div><div class="players-yetToPlayer" style="text-align:center;width:33.3%">YTP</div><div class="players-playingMin" style="width:33.3%;text-align:center">PMR</div></div><div class="players-val-wrap" style="display:inline-flex;width:100%"><div class="players-playing-val" style="width:33.3%;text-align:center">${franchise.playersCurrentlyPlaying}</div><div class="players-yetToPlayer-val" style="width:33.3%;text-align:center">${franchise.playersYetToPlay}</div><div class="players-playingMin-val" style="width:33.3%;text-align:center">${(franchise.gameSecondsRemaining / 60).toFixed(2)}</div></div></div>`);
						}
						parts.push(`<div class="franchise-bye" style="display:none">Bye Week</div><div class="franchise-avg" style="display:none">vs Average</div>`);
						parts.push(`${createAndEditScoreElement(franchise).outerHTML}`);
						parts.push(`</div>`); // close div.scoresContainer
						parts.push(`<div class="playerContainer">`); // open div.playerContainer
						parts.push(`<div class="players">`); // open div.players
						parts.push(`<div class="lsm_statusText">Starters</div>`);
						let hasStarter = false;
						for (const playerScore of playerList) {
							if (playerScore && playerScore.id) {
								if (playerScore.status === "starter") {
									if (typeof playerScore.playerStatus === 'undefined') {
										playerScore.playerStatus = "done"; // Define it as "done"
									}
									hasStarter = true;
									const newsEnabled = (window.MFLPopupEnablePlayerNews === true && window.MFLnewsEnableScoreboard === true);
									const newsAttr = newsEnabled ? lsmGetNewsAttr(playerScore.id) : null;
									const titleAttr = newsEnabled ? ' title="View Player News"' : '';
									const dataNewsAttr = newsAttr ? ` data-news="${newsAttr}"` : '';
									if (lsm_customPositions) {
										var playerInfo = lsm_playerDatabase.players["pid_" + playerScore.id];
									} else {
										var playerInfo = playerDatabase["pid_" + playerScore.id];
									}
									const scoreVal = Number(playerScore?.score ?? 0);
									let playerProjectedScore;
									let injuryStatus = "none";
									if (showInjury) {
										matchingInjury = injuryArray.find((injury) => injury.id === playerScore.id);
										if (matchingInjury) {
											injuryStatus = matchingInjury.status;
											if (injuryStatus === "Questionable") {
												injuryStatus = "Q";
											} else if (injuryStatus === "Doubtful") {
												injuryStatus = "D";
											} else if (injuryStatus === "IR-R" || injuryStatus === "IR-NFI") {
												injuryStatus = "IR";
											} else if (injuryStatus === "Healthy") {
												injuryStatus = "H";
											} else if (injuryStatus === "Out") {
												injuryStatus = "O";
											} else if (injuryStatus === "Holdout") {
												injuryStatus = "H";
											} else if (injuryStatus === "Covid") {
												injuryStatus = "C";
											} else if (injuryStatus === "Suspended") {
												injuryStatus = "S";
											} else {
												injuryStatus = "O";
											}
										} else {
											injuryStatus = "none";
										}
									}
									if (lsUseProjections) {
										try {
											playerProjectedScore = parseFloat(reportProjectedScores_ar['w_' + real_ls_week].projectedScores.playerScore.find(item => item.id === playerScore.id)?.score) || 0;
										} catch (er) {
											playerProjectedScore = 0;
										}
									}
									if (totalStarters === rowCounterStarters) {
										parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterStarters % 2 === 0 ? 'even' : 'odd'} last-div-end">`);
									} else {
										parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterStarters % 2 === 0 ? 'even' : 'odd'}">`);
									}
									if (playerInfo && hasOwn(LSpos_team_imgs, playerInfo.position)) {
										parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
										if (injuryStatus !== "none" && showInjury) {
											parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
										}
										parts.push(`<img src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg" /></div>`);
									} else {
										parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
										if (injuryStatus !== "none" && showInjury) {
											parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
										}
										parts.push(`<img src="https://www.mflscripts.com/playerImages_96x96/mfl_${playerScore.id}.png" onerror="this.src='https://www.mflscripts.com/playerImages_96x96/free_agent.png'" /></div>`);
									}
									if (playerInfo.team === 'FA' && scoreVal === 0) {
										parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Free Agent</div></div>`);
									} else if (playerInfo.team === 'FA' && scoreVal !== 0) {
										parts.push(`<div class="player-details-box hasStats"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">Free Agent</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
									} else if (matchupContent[playerInfo.team] === undefined) {
										parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Bye Week</div></div>`);
									} else {
										if (playerScore.playerStatus === "playing") {
											parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="game-time-${playerInfo.team}">${matchupGame[playerInfo.team]}</div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
										} else {
											parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
										}
									}
									if (lsUseProjections) {
										if (typeof playerScore !== 'undefined' && typeof playerScore.gameSecondsRemaining !== 'undefined' && typeof playerScore.orig_proj !== 'undefined' && typeof playerScore.pace !== 'undefined' && typeof playerScore.score !== 'undefined') {
											let scoreClass;
											if (parseFloat(playerScore.pace) > parseFloat(playerScore.orig_proj)) {
												scoreClass = 'pproj_higher';
											} else if (parseFloat(playerScore.pace) < parseFloat(playerScore.orig_proj)) {
												scoreClass = 'pproj_lower';
											} else {
												scoreClass = '';
											}
											if (playerScore.playerStatus === "playing") {
												parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.pace}</div></div>`);
											} else {
												parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.orig_proj}</div></div>`);
											}
										} else {
											parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score"></div></div>`);
										}
									} else {
										parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div></div>`);
									}
									parts.push(`</div>`);
									rowCounterStarters++;
								}
							}
						}
						if (hasStarter) {
							if (typeof franchise !== 'undefined' && typeof franchise.gameSecondsRemaining !== 'undefined' && typeof franchise.starterPaceTot !== 'undefined' && typeof franchise.starterProjTot !== 'undefined' && typeof franchise.benchTotProj !== 'undefined') {
								if (LSMfutureWeek) {
									if (franchise.adj_score) {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Projected Total</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);
									} else {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Projected Total</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}</div>`);
									}
								} else if (LSMpreviousWeek) {
									if (franchise.adj_score) {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);
									} else {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}</div>`);
									}
								} else {
									if (franchise.gameStatus === "done") {
										if (franchise.adj_score) {
											parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);
										} else {
											parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}</div>`);
										}
									} else {
										if (franchise.adj_score) {
											parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Current Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterPaceTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);
										} else {
											parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Current Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterPaceTot}</div></div></div>` : ''}</div>`);
										}
									}
								}
							} else {
								parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts"></div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv"></div></div><div class="lsTotals"><div class="lsPPTotalsPts"></div></div></div>` : ''}</div>`);
							}
						} else {
							parts.push(`<div class="no-starters-message" style="text-align:center;padding:1rem 0">Starters not submitted or are hidden</div>`);
						}
						parts.push(`</div>`); // close div.players
						parts.push(`<div id="players-bench" class="players-bench">`); // open div.players-bench
						parts.push(`<div class="lsm_statusText">Bench</div>`);
						let hasBench = false;
						for (const playerScore of playerList) {
							if (playerScore && playerScore.id) {
								if (playerScore.status === "nonstarter") {
									if (typeof playerScore.playerStatus === 'undefined') {
										playerScore.playerStatus = "done"; // Define it as "done"
									}
									hasBench = true;
									if (lsm_customPositions) {
										var playerInfo = lsm_playerDatabase.players["pid_" + playerScore.id];
									} else {
										var playerInfo = playerDatabase["pid_" + playerScore.id];
									}
									const scoreVal = Number(playerScore?.score ?? 0);
									let playerProjectedScore;
									let injuryStatus = "none";
									const newsEnabled = (window.MFLPopupEnablePlayerNews === true && window.MFLnewsEnableScoreboard === true);
									const newsAttr = newsEnabled ? lsmGetNewsAttr(playerScore.id) : null;
									const titleAttr = newsEnabled ? ' title="View Player News"' : '';
									const dataNewsAttr = newsAttr ? ` data-news="${newsAttr}"` : '';
									if (showInjury) {
										matchingInjury = injuryArray.find((injury) => injury.id === playerScore.id);
										if (matchingInjury) {
											injuryStatus = matchingInjury.status;
											if (injuryStatus === "Questionable") {
												injuryStatus = "Q";
											} else if (injuryStatus === "Doubtful") {
												injuryStatus = "D";
											} else if (injuryStatus === "IR-R" || injuryStatus === "IR-NFI") {
												injuryStatus = "IR";
											} else if (injuryStatus === "Healthy") {
												injuryStatus = "H";
											} else if (injuryStatus === "Out") {
												injuryStatus = "O";
											} else if (injuryStatus === "Holdout") {
												injuryStatus = "H";
											} else if (injuryStatus === "Covid") {
												injuryStatus = "C";
											} else if (injuryStatus === "Suspended") {
												injuryStatus = "S";
											} else {
												injuryStatus = "O";
											}
										} else {
											injuryStatus = "none";
										}
									}
									if (lsUseProjections) {
										try {
											playerProjectedScore = parseFloat(reportProjectedScores_ar['w_' + real_ls_week].projectedScores.playerScore.find(item => item.id === playerScore.id)?.score) || 0;
										} catch (er) {
											playerProjectedScore = 0;
										}
									}
									if (totalNonStarters === rowCounterBench) {
										if (matchupContent[playerInfo.team] === undefined) {
											parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'} bye last-div-end">`);
										} else {
											parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'} last-div-end">`);
										}
									} else {
										if (matchupContent[playerInfo.team] === undefined) {
											parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'} bye">`);
										} else {
											parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'}">`);
										}
									}
									if (playerInfo && hasOwn(LSpos_team_imgs, playerInfo.position)) {
										parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
										if (injuryStatus !== "none" && showInjury) {
											parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
										}
										parts.push(`<img src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg" /></div>`);
									} else {
										parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
										if (injuryStatus !== "none" && showInjury) {
											parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
										}
										parts.push(`<img src="https://www.mflscripts.com/playerImages_96x96/mfl_${playerScore.id}.png" onerror="this.src='https://www.mflscripts.com/playerImages_96x96/free_agent.png'" /></div>`);
									}
									if (playerInfo.team === 'FA' && scoreVal === 0) {
										parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Free Agent</div></div>`);
									} else if (playerInfo.team === 'FA' && scoreVal !== 0) {
										parts.push(`<div class="player-details-box hasStats"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">Free Agent</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
									} else if (matchupContent[playerInfo.team] === undefined) {
										parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Bye Week</div></div>`);
									} else {
										if (playerScore.playerStatus === "playing") {
											parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="game-time-${playerInfo.team}">${matchupGame[playerInfo.team]}</div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
										} else {
											parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
										}
									}
									if (lsUseProjections) {
										if (typeof playerScore !== 'undefined' && typeof playerScore.gameSecondsRemaining !== 'undefined' && typeof playerScore.orig_proj !== 'undefined' && typeof playerScore.pace !== 'undefined' && typeof playerScore.score !== 'undefined') {
											let scoreClass;
											if (parseFloat(playerScore.pace) > parseFloat(playerScore.orig_proj)) {
												scoreClass = 'pproj_higher';
											} else if (parseFloat(playerScore.pace) < parseFloat(playerScore.orig_proj)) {
												scoreClass = 'pproj_lower';
											} else {
												scoreClass = '';
											}
											if (playerScore.playerStatus === "playing") {
												parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.pace}</div></div>`);
											} else {
												parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.orig_proj}</div></div>`);
											}
										} else {
											parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score"></div></div>`);
										}
									} else {
										parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div></div>`);
									}
									parts.push(`</div>`);
									rowCounterBench++;
								}
							}
						}

						if (!hasBench) {
							parts.push(`<div class="no-starters-message" style="text-align:center;padding:1rem 0">Franchise has no bench players</div>`);
						}
						if (hasBench) {
							if (typeof franchise.benchTot === 'undefined') {
								franchise.benchTot = "0"; // Define it as "done"
							}
							if (typeof franchise !== 'undefined' && typeof franchise.gameSecondsRemaining !== 'undefined' && typeof franchise.starterPaceTot !== 'undefined' && typeof franchise.starterProjTot !== 'undefined' && typeof franchise.benchTotProj !== 'undefined') {
								if (LSMfutureWeek) {
									parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Projected Total</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchTotProj}</div></div></div>` : ''}</div>`);
								} else if (LSMpreviousWeek) {
									parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchTotProj}</div></div></div>` : ''}</div>`);
								} else {
									if (franchise.benchStatus === "done") {
										parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchTotProj}</div></div></div>` : ''}</div>`);
									} else {
										parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Current Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchPaceTot}</div></div></div>` : ''}</div>`);
									}
								}
							} else {
								parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv"></div></div><div class="lsTotals"><div class="lsPPTotalsPts"></div></div></div>` : ''}</div>`);
							}
						}
						parts.push(`</div>`); // close div.players-bench
						parts.push(`</div>`); // close div.playerContainer
						parts.push(`</div>`); // close div.franchise-box
					}
				}
				parts.push(`</div>`); // close div.matchup-box
			}
		}
	} else if (LSMLiveScoring.franchise) {
		for (m in LSMLiveScoring.franchise) {
			m = parseInt(m, 10);
			if (m === LSMmatchupIndex) {
				let franchise = LSMLiveScoring.franchise[m];
				let matchupBoxClass = 'matchup-box single-matchup';
				if (franchise.gameStatus === 'done') {
					matchupBoxClass = 'matchup-box single-matchup matchupOver';
				}
				let totalStarters = 0;
				let totalNonStarters = 0;
				let rowCounterStarters = 1;
				let rowCounterBench = 1;
				let franchiseInfo = franchiseDatabase["fid_" + franchise.id];
				parts.push(`<div id="matchup_${m}" class="${matchupBoxClass}">`);
				if (franchise.id === "BYE" || franchise.id === "AVG") {
					// do not build players containers for bye or avg franchises
				} else {
					const playerList = franchise?.players?.player || [];

					for (const playerScore of playerList) {
						if (!playerScore?.id) continue;

						if (playerScore.status === "starter") totalStarters++;
						if (playerScore.status === "nonstarter") totalNonStarters++;
					}
					if (!playerList.length) {
						console.warn("No players for franchise", franchise?.id);
					}
					parts.push(`<div id="franchise_${franchise.id}" class="franchise-box">`);
					parts.push(`<div class="scoresContainer">`); // open div.scoresContainer
					if (lsAppearance === 0) {
						parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.icon ? franchiseInfo.icon : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}</a></h2></div>`);
					} else if (lsAppearance === 1) {
						parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.icon ? franchiseInfo.icon : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div>`);
					} else if (lsAppearance === 2) {
						parts.push(`<div class="franchise-name"><h2><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}</a></h2></div>`);
					} else if (lsAppearance === 3) {
						parts.push(`<div class="franchise-name"><h2><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.abbrev ? franchiseInfo.abbrev : ''}</a></h2></div>`);
					} else if (lsAppearance === 4) {
						parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.icon ? franchiseInfo.icon : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.abbrev ? franchiseInfo.abbrev : ''}</a></h2></div>`);
					} else if (lsAppearance === 5) {
						parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.logo ? franchiseInfo.logo : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div>`);
					} else if (lsAppearance === 6) {
						parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.logo ? franchiseInfo.logo : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}</a></h2></div>`);
					} else if (lsAppearance === 7) {
						parts.push(`<div class="franchise-icon"><a style="height:100%;width:100%;text-align:center" href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01"><img src="${franchiseInfo && franchiseInfo.logo ? franchiseInfo.logo : ''}" alt="${franchiseInfo && franchiseInfo.name ? franchiseInfo.name : ''}" /></a></div><div class="franchise-name"><h2><a href="${baseURLDynamic}/${year}/options?L=${league_id}&F=${franchise.id}&O=01">${franchiseInfo && franchiseInfo.abbrev ? franchiseInfo.abbrev : ''}</a></h2></div>`);
					}
					if (fidToRecordMap[franchise.id] !== "NaN-NaN-NaN") {
						parts.push(`<div class="franchise-record" style="padding:.1rem">${fidToRecordMap[franchise.id]}</div>`);
					}
					if (LSMcurrentWeek && lsmPMR) {
						parts.push(`<div class="franchise-pmr-wrap pmr_${franchise.id}" style="margin-bottom:0.175rem;padding:0.275rem;text-align:center"><div class="players-pmr-wrap" style="display:inline-flex;width:100%"><div class="players-playing" style="text-align:center;width:33.3%">P</div><div class="players-yetToPlayer" style="text-align:center;width:33.3%">YTP</div><div class="players-playingMin" style="width:33.3%;text-align:center">PMR</div></div><div class="players-val-wrap" style="display:inline-flex;width:100%"><div class="players-playing-val" style="width:33.3%;text-align:center">${franchise.playersCurrentlyPlaying}</div><div class="players-yetToPlayer-val" style="width:33.3%;text-align:center">${franchise.playersYetToPlay}</div><div class="players-playingMin-val" style="width:33.3%;text-align:center">${(franchise.gameSecondsRemaining / 60).toFixed(2)}</div></div></div>`);
					}
					parts.push(`<div class="franchise-bye" style="display:none">Bye Week</div><div class="franchise-avg" style="display:none">vs Average</div>`);
					parts.push(`${createAndEditScoreElement(franchise).outerHTML}`);
					parts.push(`</div>`); // close div.scoresContainer
					parts.push(`<div class="playerContainer">`); // open div.playerContainer
					parts.push(`<div class="players">`); // open div.players
					parts.push(`<div class="lsm_statusText">Starters</div>`);
					let hasStarter = false;
					for (const playerScore of playerList) {
						if (playerScore && playerScore.id) {
							if (playerScore.status === "starter") {
								if (typeof playerScore.playerStatus === 'undefined') {
									playerScore.playerStatus = "done"; // Define it as "done"
								}
								hasStarter = true;
								const newsEnabled = (window.MFLPopupEnablePlayerNews === true && window.MFLnewsEnableScoreboard === true);
								const newsAttr = newsEnabled ? lsmGetNewsAttr(playerScore.id) : null;
								const titleAttr = newsEnabled ? ' title="View Player News"' : '';
								const dataNewsAttr = newsAttr ? ` data-news="${newsAttr}"` : '';
								if (lsm_customPositions) {
									var playerInfo = lsm_playerDatabase.players["pid_" + playerScore.id];
								} else {
									var playerInfo = playerDatabase["pid_" + playerScore.id];
								}
								const scoreVal = Number(playerScore?.score ?? 0);
								let playerProjectedScore;
								let injuryStatus = "none";
								if (showInjury) {
									matchingInjury = injuryArray.find((injury) => injury.id === playerScore.id);
									if (matchingInjury) {
										injuryStatus = matchingInjury.status;
										if (injuryStatus === "Questionable") {
											injuryStatus = "Q";
										} else if (injuryStatus === "Doubtful") {
											injuryStatus = "D";
										} else if (injuryStatus === "IR-R" || injuryStatus === "IR-NFI") {
											injuryStatus = "IR";
										} else if (injuryStatus === "Healthy") {
											injuryStatus = "H";
										} else if (injuryStatus === "Out") {
											injuryStatus = "O";
										} else if (injuryStatus === "Holdout") {
											injuryStatus = "H";
										} else if (injuryStatus === "Covid") {
											injuryStatus = "C";
										} else if (injuryStatus === "Suspended") {
											injuryStatus = "S";
										} else {
											injuryStatus = "O";
										}
									} else {
										injuryStatus = "none";
									}
								}
								if (lsUseProjections) {
									try {
										playerProjectedScore = parseFloat(reportProjectedScores_ar['w_' + real_ls_week].projectedScores.playerScore.find(item => item.id === playerScore.id)?.score) || 0;
									} catch (er) {
										playerProjectedScore = 0;
									}
								}
								if (totalStarters === rowCounterStarters) {
									parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterStarters % 2 === 0 ? 'even' : 'odd'} last-div-end">`);
								} else {
									parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterStarters % 2 === 0 ? 'even' : 'odd'}">`);
								}
								if (playerInfo && hasOwn(LSpos_team_imgs, playerInfo.position)) {
									parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
									if (injuryStatus !== "none" && showInjury) {
										parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
									}
									parts.push(`<img src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg" /></div>`);
								} else {
									parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
									if (injuryStatus !== "none" && showInjury) {
										parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
									}
									parts.push(`<img src="https://www.mflscripts.com/playerImages_96x96/mfl_${playerScore.id}.png" onerror="this.src='https://www.mflscripts.com/playerImages_96x96/free_agent.png'" /></div>`);
								}
								if (playerInfo.team === 'FA' && scoreVal === 0) {
									parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Free Agent</div></div>`);
								} else if (playerInfo.team === 'FA' && scoreVal !== 0) {
									parts.push(`<div class="player-details-box hasStats"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">Free Agent</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
								} else if (matchupContent[playerInfo.team] === undefined) {
									parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Bye Week</div></div>`);
								} else {
									if (playerScore.playerStatus === "playing") {
										parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="game-time-${playerInfo.team}">${matchupGame[playerInfo.team]}</div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
									} else {
										parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
									}
								}
								if (lsUseProjections) {
									if (typeof playerScore !== 'undefined' && typeof playerScore.gameSecondsRemaining !== 'undefined' && typeof playerScore.orig_proj !== 'undefined' && typeof playerScore.pace !== 'undefined' && typeof playerScore.score !== 'undefined') {
										let scoreClass;
										if (parseFloat(playerScore.pace) > parseFloat(playerScore.orig_proj)) {
											scoreClass = 'pproj_higher';
										} else if (parseFloat(playerScore.pace) < parseFloat(playerScore.orig_proj)) {
											scoreClass = 'pproj_lower';
										} else {
											scoreClass = '';
										}
										if (playerScore.playerStatus === "playing") {
											parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.pace}</div></div>`);
										} else {
											parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.orig_proj}</div></div>`);
										}
									} else {
										parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score"></div></div>`);
									}
								} else {
									parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div></div>`);
								}
								parts.push(`</div>`);
								rowCounterStarters++;
							}
						}
					}
					if (hasStarter) {
						if (typeof franchise !== 'undefined' && typeof franchise.gameSecondsRemaining !== 'undefined' && typeof franchise.starterPaceTot !== 'undefined' && typeof franchise.starterProjTot !== 'undefined' && typeof franchise.benchTotProj !== 'undefined') {
							if (LSMfutureWeek) {
								if (franchise.adj_score) {
									parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div>
<div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Projected Total</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);
								} else {
									parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div>
<div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Projected Total</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}</div>`);
								}
							} else if (LSMpreviousWeek) {
								if (franchise.adj_score) {
									parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);

								} else {
									parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div>
<div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}</div>`);
								}
							} else {
								if (franchise.gameStatus === "done") {
									if (franchise.adj_score) {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Current Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterPaceTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);
									} else {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div>
<div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterProjTot}</div></div></div>` : ''}</div>`);
									}
								} else {
									if (franchise.adj_score) {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.Playersscore}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Current Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterPaceTot}</div></div></div>` : ''}<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">+ Adjusted Points</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.adj_score}</div></div></div><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div></div>`);

									} else {
										parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div>
<div class="lsTotals"><div class="lsTotalsDivPts">${franchise.score}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Current Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.starterPaceTot}</div></div></div>` : ''}</div>`);
									}
								}
							}
						} else {
							parts.push(`<div data-franchise="${franchise.id}" class="lsStarterstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Starters Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts"></div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv"></div></div><div class="lsTotals"><div class="lsPPTotalsPts"></div></div></div>` : ''}</div>`);
						}
					} else {
						parts.push(`<div class="no-starters-message" style="text-align:center;padding:1rem 0">Starters not submitted or are hidden</div>`);
					}
					parts.push(`</div>`); // close div.players
					parts.push(`<div id="players-bench" class="players-bench">`); // open div.players-bench
					parts.push(`<div class="lsm_statusText">Bench</div>`);
					let hasBench = false;
					for (const playerScore of playerList) {
						if (playerScore && playerScore.id) {
							if (playerScore.status === "nonstarter") {
								if (typeof playerScore.playerStatus === 'undefined') {
									playerScore.playerStatus = "done"; // Define it as "done"
								}
								hasBench = true;
								if (lsm_customPositions) {
									var playerInfo = lsm_playerDatabase.players["pid_" + playerScore.id];
								} else {
									var playerInfo = playerDatabase["pid_" + playerScore.id];
								}
								const scoreVal = Number(playerScore?.score ?? 0);
								let playerProjectedScore;
								let injuryStatus = "none";
								const newsEnabled = (window.MFLPopupEnablePlayerNews === true && window.MFLnewsEnableScoreboard === true);
								const newsAttr = newsEnabled ? lsmGetNewsAttr(playerScore.id) : null;
								const titleAttr = newsEnabled ? ' title="View Player News"' : '';
								const dataNewsAttr = newsAttr ? ` data-news="${newsAttr}"` : '';
								if (showInjury) {
									matchingInjury = injuryArray.find((injury) => injury.id === playerScore.id);
									if (matchingInjury) {
										injuryStatus = matchingInjury.status;
										if (injuryStatus === "Questionable") {
											injuryStatus = "Q";
										} else if (injuryStatus === "Doubtful") {
											injuryStatus = "D";
										} else if (injuryStatus === "IR-R" || injuryStatus === "IR-NFI") {
											injuryStatus = "IR";
										} else if (injuryStatus === "Healthy") {
											injuryStatus = "H";
										} else if (injuryStatus === "Out") {
											injuryStatus = "O";
										} else if (injuryStatus === "Holdout") {
											injuryStatus = "H";
										} else if (injuryStatus === "Covid") {
											injuryStatus = "C";
										} else if (injuryStatus === "Suspended") {
											injuryStatus = "S";
										} else {
											injuryStatus = "O";
										}
									} else {
										injuryStatus = "none";
									}
								}
								if (lsUseProjections) {
									try {
										playerProjectedScore = parseFloat(reportProjectedScores_ar['w_' + real_ls_week].projectedScores.playerScore.find(item => item.id === playerScore.id)?.score) || 0;
									} catch (er) {
										playerProjectedScore = 0;
									}
								}
								if (totalNonStarters === rowCounterBench) {
									if (matchupContent[playerInfo.team] === undefined) {
										parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'} bye last-div-end">`);
									} else {
										parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'} last-div-end">`);
									}
								} else {
									if (matchupContent[playerInfo.team] === undefined) {
										parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'} bye">`);
									} else {
										parts.push(`<div id="player_row_${playerScore.id}" data-team="${playerInfo.team}" class="player-row position-order-${playerInfo.position} ${playerInfo.team} ${playerScore.playerStatus} ${rowCounterBench % 2 === 0 ? 'even' : 'odd'}">`);
									}
								}
								if (playerInfo && hasOwn(LSpos_team_imgs, playerInfo.position)) {
									parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
									if (injuryStatus !== "none" && showInjury) {
										parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
									}
									parts.push(`<img src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg" /></div>`);
								} else {
									parts.push(`<div class="player-image" id="image_${playerScore.id}"><div class="player-position">${playerInfo.position}</div>`);
									if (injuryStatus !== "none" && showInjury) {
										parts.push(`<span title="Injury Status" class="inj_status">${injuryStatus}</span>`);
									}
									parts.push(`<img src="https://www.mflscripts.com/playerImages_96x96/mfl_${playerScore.id}.png" onerror="this.src='https://www.mflscripts.com/playerImages_96x96/free_agent.png'" /></div>`);
								}
								if (playerInfo.team === 'FA' && scoreVal === 0) {
									parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Free Agent</div></div>`);
								} else if (playerInfo.team === 'FA' && scoreVal !== 0) {
									parts.push(`<div class="player-details-box hasStats"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">Free Agent</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
								} else if (matchupContent[playerInfo.team] === undefined) {
									parts.push(`<div class="player-details-box free-agent"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info">Bye Week</div></div>`);
								} else {
									if (playerScore.playerStatus === "playing") {
										parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="game-time-${playerInfo.team}">${matchupGame[playerInfo.team]}</div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
									} else {
										parts.push(`<div class="player-details-box"><div class="player-name"><h3><a href="player?L=${league_id}&P=${playerScore.id}" class="position_${playerInfo.position}" target="new" data-player-id="${playerScore.id}"${titleAttr}${dataNewsAttr}>${formatPlayerNameLSModule(playerInfo.name)}</a></h3><div class="player-team"><img alt="${playerInfo.team}" src="https://www.mflscripts.com/ImageDirectory/script-images/nflTeamsvg_2/${playerInfo.team}.svg"></div></div><div class="game-info"><div class="game-status ${playerInfo.team}">${matchupContent[playerInfo.team]}</div></div><div class="player-stats stats_${playerScore.id}">${playerInfo.position === 'Def' ? get_TEAMstats_str(playerInfo.team, false) : (playerInfo.position === 'Off' ? get_TEAMstats_str(playerInfo.team, true) : doLSMBoxLiveStats(playerScore.id))}</div></div>`);
									}
								}
								if (lsUseProjections) {
									if (typeof playerScore !== 'undefined' && typeof playerScore.gameSecondsRemaining !== 'undefined' && typeof playerScore.orig_proj !== 'undefined' && typeof playerScore.pace !== 'undefined' && typeof playerScore.score !== 'undefined') {
										let scoreClass;
										if (parseFloat(playerScore.pace) > parseFloat(playerScore.orig_proj)) {
											scoreClass = 'pproj_higher';
										} else if (parseFloat(playerScore.pace) < parseFloat(playerScore.orig_proj)) {
											scoreClass = 'pproj_lower';
										} else {
											scoreClass = '';
										}
										if (playerScore.playerStatus === "playing") {
											parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.pace}</div></div>`);
										} else {
											parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score ${scoreClass}">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score">${playerScore.orig_proj}</div></div>`);
										}
									} else {
										parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div><div data-pid="${playerScore.id}" class="player-projected-score"></div></div>`);
									}
								} else {
									parts.push(`<div class="player-score-box" id="score_box_${playerScore.id}"><div data-pid="${playerScore.id}" data-team="${playerScore.team || ""}" data-pos="${playerScore.position || ""}" title="View Player Scoring" class="player-live-score">${playerScore.score}</div></div>`);
								}
								parts.push(`</div>`);
								rowCounterBench++;
							}
						}
					}

					if (!hasBench) {
						parts.push(`<div class="no-starters-message" style="text-align:center;padding:1rem 0">Franchise has no bench players</div>`);
					}
					if (hasBench) {
						if (typeof franchise.benchTot === 'undefined') {
							franchise.benchTot = "0"; // Define it as "done"
						}
						if (typeof franchise !== 'undefined' && typeof franchise.gameSecondsRemaining !== 'undefined' && typeof franchise.starterPaceTot !== 'undefined' && typeof franchise.starterProjTot !== 'undefined' && typeof franchise.benchTotProj !== 'undefined') {
							if (LSMfutureWeek) {
								parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Projected Total</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchTotProj}</div></div></div>` : ''}</div>`);
							} else if (LSMpreviousWeek) {
								parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchTotProj}</div></div></div>` : ''}</div>`);
							} else {
								if (franchise.benchStatus === "done") {
									parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Original Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchTotProj}</div></div></div>` : ''}</div>`);
								} else {
									parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv">Current Projection</div></div><div class="lsTotals"><div class="lsPPTotalsPts original-projection">${franchise.benchPaceTot}</div></div></div>` : ''}</div>`);
								}
							}
						} else {
							parts.push(`<div data-franchise="${franchise.id}" class="lsBenchstotals position-order-totals"><div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsTotalsDiv">Bench Total</div></div><div class="lsTotals"><div class="lsTotalsDivPts">${franchise.benchTot}</div></div></div>${lsUseProjections ? `<div class="LsTotalsRow"><div class="lsTotalsTxt"><div class="lsPPTotalsDiv"></div></div><div class="lsTotals"><div class="lsPPTotalsPts"></div></div></div>` : ''}</div>`);
						}
					}
					parts.push(`</div>`); // close div.players-bench
					parts.push(`</div>`); // close div.playerContainer
					parts.push(`</div>`); // close div.franchise-box
				}
				parts.push(`</div>`); // close div.matchup-box
			}
		}
	}
	LSMscoringBox.innerHTML = parts.join('');
	LSMscoringBox.querySelectorAll('.players, .players-bench').forEach(function (container) {
		var typeSet = new Set();
		container.querySelectorAll('.player-row').forEach(function (playerRow) {
			var typeMatch = playerRow.className.match(/position-order-\w+/);
			if (typeMatch && !typeSet.has(typeMatch[0])) {
				typeSet.add(typeMatch[0]);
				var lastOfType = Array.from(container.querySelectorAll('.player-row.' + typeMatch[0])).pop();
				if (lastOfType) {
					var positionChangeDiv = document.createElement('div');
					positionChangeDiv.className = 'positionChange_' + typeMatch[0];
					lastOfType.insertAdjacentElement('afterend', positionChangeDiv);
				}
			}
		});
	});
	try {
		MFLPlayerPopupNewsIcon("LSscoringBox")
	} catch (er) {}
}

// CREATE SCOREBOARD NUMBERS //
function createAndEditScoreElement(franchise) {
	var scoreElement = document.createElement('div');
	scoreElement.className = 'franchise-score score_' + franchise.id;
	scoreElement.textContent = franchise.score;

	var _score = scoreElement.textContent;
	var _oldScore = _score;
	var min_digits = 11;
	var use_blanks = true;

	for (var i = min_digits; i > _oldScore.length; i--) {
		_score = (use_blanks ? 'x' : '0') + _score;
	}

	// Build HTML using array push/join (same final HTML as +=)
	var parts = new Array(_score.length);

	for (var j = 0; j < _score.length; j++) {
		var ch = _score.charAt(j);
		var idx = j + 1;

		if (ch === "x") {
			parts[j] = '<span class="blank ls_num_' + idx + '"><a></a></span>';
		} else {
			parts[j] = '<span class="ls_num_' + idx + '"><a>' + ch + '</a></span>';
		}
	}

	scoreElement.innerHTML = parts.join('');
	return scoreElement;
}

(function () {
	document.addEventListener("click", function (e) {
		const linkInTeamBox = e.target.closest("#teamBox a");
		if (!linkInTeamBox) return;
		//document.getElementById("teamBoxOverlay")?.classList.add("hideThis");
		//document.getElementById("teamBox")?.classList.add("hideThis");
	}, true);
	document.addEventListener("click", function (e) {
		if (e.target.closest(".scoredetailsWrap") || e.target.closest("#MFLPlayerPopupClose") || e.target.closest("#MFLPlayerPopupOverlay")) {
			//document.getElementById("teamBoxOverlay")?.classList.remove("hideThis");
			//document.getElementById("teamBox")?.classList.remove("hideThis");
		}
	}, true);
})();

if (liveScoringWeek > 0) {
	if (!lsShowNFLbox && !(liveScoringWeek >= startWeek)) {
		LSMhideShow.style.display = 'block';
		LSMhideShow.innerHTML = '<h2 class="lsm_error error_box" style="margin:0 auto;">Live Scoring will start 24 hours before 1st game of the season</h2>';
	} else {
		(async () => {
			try {
				await fetchScoringFunctions();
				window.MFLGlobalCache.onReady(() => {
					try {
						LSMload();

						// BUILD SELECT WEEK AND CHECK BOXES HTML //
						const elementCheckBox = document.getElementById('LSModuleCheckProjections');
						const elementCheckBox2 = document.getElementById('LSModuleCheckBench');
						const elementCheckBox3 = document.getElementById('LSModuleCheckStats');
						const elementCheckBox4 = document.getElementById('LSModuleCheckNFL');
						const styleTag = document.createElement('style');
						styleTag.classList.add('hideNFL');
						styleTag.textContent = '.nfl-box-scroll-wrap{display:none!important}';
						const styleTag1 = document.createElement('style');
						styleTag1.classList.add('hideProjections');
						styleTag1.textContent = '.hide-proj,#LSscoringBox .player-projected-score,#LSscoringBox .lsPPTotalsDiv,#LSscoringBox .lsPPTotalsPts,.matchup-box-scroll-wrap .franchise-pp-scroll{display:none!important}';
						const styleTag2 = document.createElement('style');
						styleTag2.classList.add('hideSTATS');
						styleTag2.textContent = '#LSscoringBox .player-stats{display:none!important}';
						const styleTag3 = document.createElement('style');
						styleTag3.classList.add('hideBENCH');
						styleTag3.textContent = '#LSscoringBox .players-bench{display:none!important}';
						var selectBoxHTML = '';
						selectBoxHTML += '<span onclick="LSModuletoggleSlide()" class="lsm_toggle_settings" style="cursor:pointer;font-size:1rem;padding-left:0.313rem;width:100%;display:table;">';
						selectBoxHTML += '<i class="fa-regular fa-gears" aria-hidden="true"></i> Settings<span id="lsmWeekNo" style="float:right">Week ' + real_ls_week + '</span>';
						selectBoxHTML += '</span>';
						selectBoxHTML += '<div class="lsModuleSlide" style="display:none">';
						if (lsShowNFLbox) {
							if (elementCheckBox4 === null) {
								if (localStorage["LSModule_nflBox_" + league_id] === "1") {
									document.body.appendChild(styleTag);
									selectBoxHTML += '<div id="LSModuleCheckNFL" style="pointer-events:auto"><input type="checkbox" name="lh_NFL_checkbox" id="lh_NFL_checkbox" onclick="LSModule_checkbox(\'nflBox\',this)"><label for="lh_NFL_checkbox" style="margin-right:0">NFL</label></div>';
								} else {
									document.querySelectorAll('style.hideNFL').forEach(styleElement => styleElement.remove());
									selectBoxHTML += '<div id="LSModuleCheckNFL" style="pointer-events:auto"><input type="checkbox" name="lh_NFL_checkbox" id="lh_NFL_checkbox" checked="checked" onclick="LSModule_checkbox(\'nflBox\',this)"><label for="lh_NFL_checkbox" style="margin-right:0">NFL</label></div>';
								}
							} else {
								if (localStorage["LSModule_nflBox_" + league_id] === "1") {
									document.body.appendChild(styleTag);
								} else {
									document.querySelectorAll('style.hideNFL').forEach(styleElement => styleElement.remove());
								}
							}
						}
						if (elementCheckBox3 === null) {
							if (localStorage["LSModule_stats_" + league_id] === "1") {
								document.body.appendChild(styleTag2);
								selectBoxHTML += '<div id="LSModuleCheckStats" style="pointer-events:auto"><input type="checkbox" name="lh_stats_checkbox" id="lh_stats_checkbox" onclick="LSModule_checkbox(\'stats\',this)"><label for="lh_stats_checkbox" style="margin-right:0">Stats</label></div>';
							} else {
								document.querySelectorAll('style.hideSTATS').forEach(styleElement => styleElement.remove());
								selectBoxHTML += '<div id="LSModuleCheckStats" style="pointer-events:auto"><input type="checkbox" name="lh_stats_checkbox" id="lh_stats_checkbox" checked="checked" onclick="LSModule_checkbox(\'stats\',this)"><label for="lh_stats_checkbox" style="margin-right:0">Stats</label></div>';
							}
						} else {
							if (localStorage["LSModule_stats_" + league_id] === "1") {
								document.body.appendChild(styleTag2);
							} else {
								document.querySelectorAll('style.hideSTATS').forEach(styleElement => styleElement.remove());
							}
						}
						if (elementCheckBox2 === null) {
							if (localStorage["LSModule_bench_" + league_id] === "1") {
								document.body.appendChild(styleTag3);
								selectBoxHTML += '<div id="LSModuleCheckBench" style="pointer-events:auto"><input type="checkbox" name="lh_bench_checkbox" id="lh_bench_checkbox" onclick="LSModule_checkbox(\'bench\',this)"><label for="lh_bench_checkbox" style="margin-right:0">Bench</label></div>';
							} else {
								document.querySelectorAll('style.hideBENCH').forEach(styleElement => styleElement.remove());
								selectBoxHTML += '<div id="LSModuleCheckBench" style="pointer-events:auto"><input type="checkbox" name="lh_bench_checkbox" id="lh_bench_checkbox" checked="checked" onclick="LSModule_checkbox(\'bench\',this)"><label for="lh_bench_checkbox" style="margin-right:0">Bench</label></div>';
							}
						} else {
							if (localStorage["LSModule_bench_" + league_id] === "1") {
								document.body.appendChild(styleTag3);
							} else {
								document.querySelectorAll('style.hideBENCH').forEach(styleElement => styleElement.remove());
							}
						}
						if (lsUseProjections && elementCheckBox === null) {
							if (localStorage["LSModule_projections_" + league_id] === "1") {
								document.body.appendChild(styleTag1);
								selectBoxHTML += '<div id="LSModuleCheckProjections" style="pointer-events:auto"><input type="checkbox" name="lh_projections_checkbox" id="lh_projections_checkbox" onclick="LSModule_checkbox(\'projections\',this)"><label for="lh_projections_checkbox" style="margin-right:0">Projections</label></div>';
							} else {
								document.querySelectorAll('style.hideProjections').forEach(styleElement => styleElement.remove());
								selectBoxHTML += '<div id="LSModuleCheckProjections" style="pointer-events:auto"><input type="checkbox" name="lh_projections_checkbox" id="lh_projections_checkbox" checked="checked" onclick="LSModule_checkbox(\'projections\',this)"><label for="lh_projections_checkbox" style="margin-right:0">Projections</label></div>';
							}
						} else if (lsUseProjections) {
							if (localStorage["LSModule_projections_" + league_id] === "1") {
								document.body.appendChild(styleTag1);
							} else {
								document.querySelectorAll('style.hideProjections').forEach(styleElement => styleElement.remove());
							}
						}
						selectBoxHTML += '<select id="weekSelectorLSModule"><option value="" disabled selected>Select Week</option></select>';
						selectBoxHTML += '</div>';
						LSMSettingsContainer.innerHTML = selectBoxHTML;
						populateWeekSelectorLSModule();
					} catch (_) {
						LSMhideShow.style.display = "block";
						LSMhideShow.innerHTML =
							'<h2 class="lsm_error error_box" style="margin:0 auto;">Live Scoring will start 24 hours before 1st game of the season</h2>';
					}
				});
			} catch (_) {
				LSMhideShow.style.display = 'block';
				LSMhideShow.innerHTML = '<h2 class="lsm_error error_box" style="margin:0 auto;">Live Scoring will start 24 hours before 1st game of the season</h2>';
			}
		})();
	}
} else {
	LSMhideShow.style.display = 'block';
	LSMhideShow.innerHTML = '<h2 class="lsm_error error_box" style="margin:0 auto;">Live Scoring will start 24 hours before 1st game of the season</h2>';
}

// CREATE SCOREBOARD GLOBAL CSS //
const LSMstyleAdd = document.createElement('style');
const LSMcssRules = `
.hideThis {display:none!important}
div#LSscoringBox {
  display: flex;
  position: relative;
  width: 100%;
  flex-flow: row;
  overflow: hidden;
}
#LSscoringBox .matchup-box {
  flex: none;
  width: 100%;
  display: flex;
  flex-flow: row;
  flex-shrink: 0;
  flex-grow: 0;
}
#LSscoringBox .franchise-box {
  width: 50%;
  display: block;
  position: relative;
  border-radius: 0.188rem;
  padding: 0.625rem;
  margin-right: 0.25rem;
  height: fit-content;
}
#LSscoringBox .franchise-box + .franchise-box {
  margin: 0 0 0 0.25rem;
}
#LSscoringBox .single-matchup .franchise-box {
  width: 100%;
  margin: 0 auto;
  max-width: 31.25rem;
}
#LSscoringBox div.franchise-icon,
#LSscoringBox .franchise-name {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
#LSscoringBox div.franchise-record {
  text-align: center;
  font-size: 1.2rem;
}
#LSscoringBox .players {
  display: flex;
  flex-flow: column;
}
#LSscoringBox .players,
#LSscoringBox .players-bench {
  margin-top: -0.125rem;
  border-bottom: 0;
}
#LSscoringBox .player-row {
  display: flex;
  flex: 1 0 100%;
  flex-flow: row;
  padding: 0.25rem 0;
  flex-basis: 4.688rem;
  position: relative;
}
#LSscoringBox .players-bench {
  display: flex;
  flex-flow: column;
}
#LSscoringBox .lsm_statusText {
  font-weight: bold;
  padding: 0.225rem;
  font-size: 1rem;
}
#LSscoringBox .matchup-box .franchise-box + .franchise-box .lsm_statusText {
  text-align: right;
}
#LSscoringBox .matchup-box.avg-matchup .franchise-box + .franchise-box .lsm_statusText,
#LSscoringBox .matchup-box.avg-matchup .franchise-box + .franchise-box .lsm_statusText {
  text-align: left;
}
#LSscoringBox .player-position {
  position: absolute;
  bottom: -.3rem;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 0.313rem;
  width: 3.5rem;
  display: block;
  text-align: center;
  font-size: 0.8rem;
  font-weight: normal;
}
#LSscoringBox .player-image {
  width: 3.5rem;
  flex-grow: 0;
  align-self: center;
  margin: 0 0.5rem;
  position: relative;
}
#LSscoringBox .player-image img {
  border-radius: 50%;
  height: 3.5rem;
  width: 3.5rem;
  margin-top: -0.5rem;
}
#LSscoringBox .player-image img[src*="svg"] {
  padding: 0.275rem;
}
#LSscoringBox .player-details-box {
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  align-self: center;
}
#LSscoringBox .player-name {
  display: flex;
  flex-flow: row;
  justify-content: left;
  align-items: center;
}
#LSscoringBox .player-name h3 {
  margin: 0;
  padding: 0;
  text-align: left;
  background: none!important;
  border: none!important;
  text-shadow: none!important;
  box-shadow: none!important;
  font-size: 1.2rem!important;
  outline: none!important;
}
#LSscoringBox .player-team {
  max-width: 1.25rem;
  flex-grow: 1;
  margin-left: 0.2rem;
}
#LSscoringBox .player-team img {
  max-height: 1.375rem;
  max-width: 1.375rem;
}
#LSscoringBox .player-score-box {
  margin: 0 0.438rem;
  min-width: 3.438rem;
  align-self: center;
}
#LSscoringBox .player-projected-score {
  font-size: 0.75rem;
  font-style: italic;
  align-self: center;
  text-align: center;
}
#LSscoringBox .franchise-name h2 {
  background: transparent;
  font-size: 1.75rem;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#LSscoringBox div.franchise-icon,
#LSscoringBox .franchise-name h2,
#LSscoringBox div.franchise-record,
#LSscoringBox div.franchise-score,
#LSscoringBox div.franchise-bye,
#LSscoringBox div.franchise-avg {
  margin-bottom: 0.175rem;
  padding: 0.275rem;
}
#LSscoringBox div.franchise-bye,
#LSscoringBox div.franchise-avg {
  text-align:center;
  font-size:.8rem
}
#LSscoringBox .bye-matchup div.franchise-bye,
#LSscoringBox .avg-matchup div.franchise-avg {
  display:block!important
}
#LSscoringBox .franchise-box:nth-child(even) .player-row .player-score-box {
  order: 1;
}
#LSscoringBox .franchise-box:nth-child(even) .player-row .player-details-box {
  order: 2;
}
#LSscoringBox .franchise-box:nth-child(even) .player-row .player-image {
  order: 3;
}
#LSscoringBox .franchise-box:nth-child(even) .player-row .player-position {
  order: 4;
}
#LSscoringBox .matchup-box.avg-matchup .franchise-box + .franchise-box .player-row .player-image {
  order: 1;
}
#LSscoringBox .matchup-box.avg-matchup .franchise-box + .franchise-box .player-row .player-details-box {
  order: 2;
}
#LSscoringBox .matchup-box.avg-matchup .franchise-box + .franchise-box .player-row .player-score-box {
  order: 3;
}
#LSscoringBox .player-live-score.beat-projection {
  font-weight: bold;
}
#LSscoringBox .player-stats {
  font-size: 0.7rem;
}
#LSscoringBox .game-info > div {
  font-size: 0.8rem;
}
#LSscoringBox .game-status {
  font-style: italic;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: left;
}
#LSscoringBox .game-status > div.matchupTime {
  flex: 0 0 100%;
  width: 100%;
}
#LSscoringBox div[class*="game-time-"] {
  font-size: 0.75rem;
}
#LSscoringBox .game-info {
  display: flex;
  flex-wrap: wrap;
}
#LSscoringBox .last-div-end {
  box-shadow: none;
  border-bottom: 0;
}
#LSscoringBox div.franchise-score {
  font-size: 2rem;
  font-weight: bold;
  padding: 0;
  border-spacing: 0.063rem;
  width: 100%;
  margin-bottom:0;
}
#LSscoringBox div.franchise-score span {
  text-align: center;
  position: relative;
  width: 1%;
  display: table-cell;
  font-weight: 600;
  font-size: 3rem;
  text-decoration: none;
  min-width: 1.875rem;
  line-height: normal;
  cursor: default;
  border-width: 0.063rem;
  border-style: solid;
}
#LSscoringBox div.franchise-score span:before,
#LSscoringBox div.franchise-score span:after {
  content: "";
  display: block;
  position: absolute;
  height: 0.188rem;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
}
#LSscoringBox div.franchise-score span:after {
  height: 0.063rem;
  left: 0;
  margin-top: 0;
}
#LSscoringBox div.franchise-score span a {
  background: none;
}
#LSscoringBox div.franchise-score span a:before,
#LSscoringBox div.franchise-score span a:after {
  content: "";
  display: block;
  position: absolute;
  height: 0.563rem;
  width: 0.188rem;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
  z-index: 1;
  border-width: 0.063rem;
  border-style: solid;
}
#LSscoringBox div.franchise-score span a:after {
  right:auto;
  left: 0;
}
#LSscoringBox div.franchise-score span.blank a {
  padding: 0.25rem;
}
#LSscoringBox .franchise-box .player-row.done div.player-image:before {
  content: "\\f05d";
  font-family: "Font Awesome 6 Pro";
  position: absolute;
  top: -0.5rem;
  z-index: 1;
  font-size: 1rem;
  left: 0;
  cursor: default;
  font-size: 0.875rem;
  height: 0.875rem;
  width: 0.875rem;
  text-align: center;
  border-radius: 50%;
}
#LSscoringBox .franchise-box .player-row.playing div.player-image:before {
  content: "\\f30d";
  font-family: "Font Awesome 6 Pro";
  position: absolute;
  z-index: 1;
  font-size: 1rem;
  left: 0;
  cursor: default;
  font-size: 0.875rem;
  height: 0.875rem;
  width: 0.875rem;
  text-align: center;
  border-radius: 50%;
  top: -0.5rem;
  font-weight: bold;
}
#LSscoringBox .franchise-box .player-row.bye div.player-image:before,
#LSscoringBox .franchise-box .player-row[data-team="FA"] div.player-image:before{
  content: "\\f30d";
}
#LSscoringBox .matchup-box .franchise-box + .franchise-box .player-row.done div.player-image:before,
#LSscoringBox .matchup-box .franchise-box + .franchise-box .player-row.playing div.player-image:before {
  right: 0;
  left: auto;
  top: -0.5rem;
}
#LSscoringBox .matchup-box.single-matchup .franchise-box + .franchise-box .player-row.done div.player-image:before,
#LSscoringBox .matchup-box.single-matchup .franchise-box + .franchise-box .player-row.playing div.player-image:before {
  right: auto;
  left: 0;
}
#weekSelectorLSModule {
  z-index: 1;
  width: 6rem;
  padding: 0.188rem 0;
  font-size: 0.875rem;
}
#LSModuleCheckProjections,
#LSModuleCheckStats,
#LSModuleCheckBench,
#LSModuleCheckNFL {
  position: relative;
  z-index: 1;
  display: inline-block;
  margin-right: 0.7rem;
  margin-top: 1.5rem;
}
#LSModuleSettings i {
  font-size: 1.2rem;
  cursor: pointer;
}
#LSModuleSettings div input {
  display: none;
}
#LSModuleSettings div label {
  padding-left: 0.938rem;
  font-size: 0.813rem;
  line-height: 0.813rem;
  cursor: pointer;
  margin-right: 0;
}
#LSModuleSettings div input:checked+label:before {
  font-family: "Font Awesome 6 Pro";
  left: 0;
  display: inline-block;
  content: "\\f046";
  z-index: 0;
}
#LSModuleSettings div input+label:before {
  font-family: "Font Awesome 6 Pro";
  display: inline-block;
  content: "\\f096";
  position: absolute;
  left: 0;
}
#LSscoringBox .LsTotalsRow {
  display: flex;
  flex: 1 0 100%;
  flex-flow: row;
  font-size: 0.9rem;
}
#LSscoringBox .lsTotals {
  margin: 0 0.438rem;
  min-width: 4rem;
  align-self: center;
  text-align: center;
}
.matchup-box-scroll-wrap {
  padding: 0.625rem;
  margin-bottom: 0.625rem;
}
#LSscoringBox .lsStarterstotals,
#LSscoringBox .lsBenchstotals {
  padding: 0.5rem 0;
}
#LSscoringBox .matchup-box .franchise-box + .franchise-box .LsTotalsRow {
  flex-direction: row-reverse;
}
#LSscoringBox .matchup-box.avg-matchup .franchise-box + .franchise-box .LsTotalsRow {
    flex-direction: row;
}
#LSscoringBox .lsTotalsTxt {
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  align-self: center;
  text-align: right;
  font-weight: bold;
}
#LSscoringBox .matchup-box .franchise-box + .franchise-box .lsTotalsTxt {
  text-align: left;
}
#LSscoringBox .matchup-box.avg-matchup .franchise-box + .franchise-box .lsTotalsTxt {
    text-align: right;
}
#LSscoringBox .lsTotalsDivPts {
  font-size: 1.25rem;
  align-self: center;
  text-align: center;
}
#LSscoringBox .lsPPTotalsPts {
  font-size: 0.8rem;
  font-style: italic;
  align-self: center;
  text-align: center;
}
.matchupRow {
    overflow-x: auto;
    overflow-y: hidden;
}
.matchupRow-track {
    min-width: 100%;
    width: max-content;
    display: flex;
    justify-content: center;
    /* real centering */
    gap: 0.1rem;
}
.matchup-box-scroll {
  cursor: pointer;
  vertical-align: middle;
  padding: 0.125rem 0.125rem;
  margin: 0.1rem;
  font-size: 0.813rem;
  display: grid;
}
.matchup-box-scroll .singleMatch {
  display: flex;
  min-height: 2.1rem;
}
.franchise-box-scroll {
  display: flex;
  flex: 1 0 100%;
  flex-flow: row;
  padding: 0.25rem 0;
  height: 3rem;
  max-height: 2rem;
}
.franchise-box-scroll[data-franchise="AVG"],
.franchise-box-scroll[data-franchise="BYE"] {
  order: 3;
}
.franchise-icon-scroll,
.franchise-name-scroll,
.franchise-score-scroll {
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  align-self: center;
}
.franchise-icon-scroll {
  order: 0;
}
.franchise-score-scroll {
  font-size: 1rem;
  text-align: right;
  order: 2;
  flex-grow: 100;
  min-width: 6ch;
}
.franchise-pp-scroll {
  flex-grow: 3;
  display: flex;
  flex-flow: column;
  align-self: center;
  text-align: right;
  order: 1;
  font-size: 0.8rem;
  font-style: italic;
  min-width: 5ch;
}
.matchup-box-scroll-wrap .franchise-name-scroll h2 {
  background:none!important;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: normal;
  max-width: 5.5rem;
  min-width: 5.5rem;
  text-align: left;
  border:0!important;
  box-shadow:none!important;
}
.matchup-box-scroll.avg-matchup .franchiseBox_AVG .franchise-name-scroll {
  flex-grow: 200;
}
.matchup-box-scroll.bye-matchup,
.matchup-box-scroll.avg-matchup {
  display: grid;
  grid-template-rows: auto auto;
}
.matchup-box-scroll.bye-matchup .score_BYE {
  font-size: 0;
}
.matchup-box-scroll.bye-matchup .franchise-box-scroll,
.matchup-box-scroll.avg-matchup .franchise-box-scroll {
  order: 1;
}
.matchup-box-scroll.bye-matchup .franchise-box-scroll.franchiseBox_BYE,
.matchup-box-scroll.avg-matchup .franchise-box-scroll.franchiseBox_AVG {
  order: 2;
}
.matchup-box-scroll-wrap .matchupIsOver .winnerMark {
  display: flex;
  align-self: center;
  order: 5;
  position: relative;
  padding: 0 !important;
  margin: 0 !important;
}
#LSscoringBox .mobile-wrap {
  width: 100%;
  margin-top: 1rem;
  max-width:37.5rem
}
#LSscoringBox .h2hmatchups th {
  text-align: left;
}
#LSscoringBox .h2hmatchups .points {
  text-align: center;
}
#LSscoringBox .h2hmatchups td.points {
  font-size: 1.2rem;
  font-weight:600;
}
.matchup-box-scroll-wrap .matchupIsOver .winnerMark:after {
  content: "\\f0d9";
  padding-left: 0.15rem;
  width: 0.8rem;
  font-size: 0;
}
.matchup-box-scroll-wrap .matchupIsOver .greater-score .winnerMark:after {
  content: "\\f0d9";
  font-family: 'Font Awesome 6 Pro';
  font-size: 1rem;
}
.matchup-box-scroll-wrap .matchupIsOver .tie-score .winnerMark:after {
  content: "T";
  font-size: 1rem;
}
.matchup-box-scroll-wrap .matchupIsOver .singleMatch.greater-score .winnerMark:after,
.matchup-box-scroll-wrap .single-matchup.matchupIsOver .greater-score .winnerMark:after {
  content: "F";
  font-size: 1rem;
  font-family: unset;
}
.matchup-box-scroll.matchupIsOver:has(#franchise_BYE) .teamOver.greater-score .winnerMark:after {
    content: "F";
    font-family: unset;
    font-size: 1rem;
}
#LSscoringBox .player-live-score {
  font-size: 1.25rem;
  align-self: center;
  text-align: center;
  cursor: pointer;
  text-decoration: underline;
}
#teamBox .appendStats {
  display: flex;
  padding: 0.25rem 0;
  font-size: 0.8rem;
}

#teamBox .appendStats-ls-events {
  flex-grow: 5;
  display: flex;
  flex-flow: column;
  align-self: center;
}
#teamBox .appendStats .ls-events,
#teamBox .appendStats .ls-pts,
#teamBox .appendStats .ls-ppts {
  display: flex;
  flex-flow: row;
  justify-content: end;
}
#teamBox .appendStats .ls-pts {
  justify-content: right;
}
#teamBox .appendStats-ls-pts {
  margin-right: 0.6rem;
  min-width: 2.438rem;
  align-self: center;
  text-align: right;
}
#teamBox .appendStats .ls-ppts,
#teamBox .appendStats .ls-ppts-pts {
  font-style: italic;
}
#teamBox .appendStats-ls-events {
  order: 2;
}
#teamBox .appendStats-ls-events .ls-events,
#teamBox .appendStats-ls-events .ls-ppts {
  justify-content: left;
}
#teamBox .ls-events.subtotal,
#teamBox .ls-pts.subtotal {
    font-weight: 600;
    margin-top: 0.25rem;
    font-size: 120%;
}
#LSscoringBox .matchup-box.avg-matchup #franchise_AVG,
.matchup_container.ls-game-scheduled .ls-down-distance,
.matchup_container.ls-game-scheduled .ls-nfl-score,
.matchup_container.ls-game-scheduled .ls-nfl-winner,
.matchup_container.ls-game-is-final .ls-down-distance,
.matchup_container.ls-game-is-final .ls-nfl-spread,
.matchup_container.ls-game-is-final .ls-nfl-team-hasBall,
.matchup_container.ls-game-is-final .lsm-nfl-records,
.matchup_container.ls-game-is-final .ls-nfl-team-redzone,
.matchup_container.ls-game-is-final .ls-down-distance,
.matchup_container.ls-game-in-progress .ls-nfl-winner,
.ls-game-in-progress.scoreChange td.ls-nfl-team-hasBall,
.ls-game-in-progress.scoreChange td.ls-nfl-team-redzone,
.ls-game-in-progress.scoreChange td.ls-down-distance {
  display: none!important;
}
/* allow the row to wrap so ::after can go underneath */
#teamBox .appendStats .ls-events,
#teamBox .appendStats .ls-pts,
#teamBox .appendStats .ls-ppts {
    flex-wrap: wrap;
}

/* line under the row content */
#teamBox .appendStats-ls-pts .ls-pts:is(:last-child, :has(+ .ls-ppts-pts))::after,
#teamBox .appendStats-ls-events .ls-events:is(:last-child, :has(+ .ls-ppts))::after {
    content: "";
    flex: 0 0 100%;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    border-style: double;
    border-width: 0 0 4px 0;
}
#teamBox .appendStats-ls-pts .ls-pts:is(:last-child, :has(+ .ls-ppts-pts))::before,
#teamBox .appendStats-ls-events .ls-events:is(:last-child, :has(+ .ls-ppts))::before {
    content: "";
    flex: 0 0 100%;
    margin-top: 0;
    margin-bottom: 0.25rem;
    border-style: double;
    border-width: 0 0 4px 0;
}
.nfl-box-scroll-wrap {
  border-radius: 0.188rem;
  width: 100%;
  display: flex;
  flex-flow: row;
  overflow: auto;
  border-radius: 0.188rem;
  padding: 0.625rem;
  margin-bottom: 0.625rem;
}
.nfl-box-scroll-wrap .lsm-NFLgrid {
    display: flex;
    margin: 0 auto;
    gap: .3em;
}
.nfl-box-scroll-wrap .nfl-box-scroll td {
  padding: 0.2rem 0.3rem;
  border: 0!important;
  box-shadow: none!important;
  font-size: .875rem;
  white-space: nowrap;
  vertical-align:middle
}
.nfl-box-scroll-wrap .matchup_container {
    display: grid;
    width: max-content;
    min-width: 9em;
}
.nfl-box-scroll-wrap .matchup_container .ls-nfl-winner {
  width: 1%;
  padding-left:0;
}
.nfl-box-scroll-wrap .matchup_container.ls-game-scheduled .ls-nfl-spread {
  font-size: 0.7rem;
  font-style: italic;
}
.nfl-box-scroll-wrap .matchup_container .ls-nfl-team-img {
  text-align: center;
  width:2rem;
  min-width: 2rem;
}
.nfl-box-scroll-wrap .ls-game-in-progress td.ls-nfl-team-hasBall,
.nfl-box-scroll-wrap .ls-game-in-progress .ls-nfl-team-redzone {
    padding: 0 !important;
    font-size: 0!important;
    width: 0!important;
}
.nfl-box-scroll-wrap .matchup_container .ls-nfl-team {
  padding-left: 0;
}
.lsm-NFLgrid .lsm-team-abbr {
    margin-left: 3px;
    width: 4ch;
    display: inline-block;
    text-align: left;
}
.nfl-box-scroll-wrap .matchup_container.ls-game-scheduled .ls-nfl-spread {
    padding: 0.2rem 0.3rem;
}
.nfl-box-scroll-wrap .matchup_container .ls-nfl-team-hasBall,
.nfl-box-scroll-wrap .matchup_container .ls-nfl-team-redzone {
  padding: 0.2rem 0;
  text-align: center;
}
#LSModuleSettings,
h2.lsm_error,
#teamBox {
  width: 100%;
  border-radius: 0.188rem;
  padding: 0.625rem;
  margin-bottom: 0.625rem;
}
#LSscoringBox .on-offense img {
  height: 0.7rem;
  width: 0.7rem;
  z-index: 2;
}
#LSscoringBox .player-row.done .on-offense img,
#LSscoringBox .player-row.done .in-redzone img,
#LSscoringBox .player-row.done div[class*="game-time-"] {
  display: none!important;
}
h2.lsm_error {
  font-size: 0.9rem;
  font-weight: normal;
}
h2.lsm_error.error_box  {
    border-radius: 0.188rem;
    width: 100%;
    border-radius: 0.188rem;
    padding: 0.625rem;
    margin-bottom: 0.625rem;
    font-size: 1rem;
}
.franchise-box-scroll.teamOver .franchise-pp-scroll {
  font-size: 0;
  color: transparent;
}
#matchup_swap_0 {
  order: 0!important;
}
#teamBox td a[href*="player"] {
  pointer-events: none!important;
  text-decoration: none!important;
}
#teamBox table th,
#teamBox table td,
#teamBox table td.points {
  text-align: center!important;
  width: 10%;
}
#teamBox table tr th:nth-child(1),
#teamBox table tr td:nth-child(1) {
  text-align: left!important;
  white-space: nowrap;
  width: 40%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
#teamBox table tr:nth-child(1) th,
#teamBox table tr:nth-child(1) + tr th:nth-child(1)[colspan] {
  text-align: center!important;
}
#teamBox table tr:nth-child(1) + tr th:nth-child(1) {
  text-align: left!important;
}
#teamBox table a img.playerPopupIcon {
    display: none !important;
}
#teamBoxOverlay {
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 99999999!important;
}
#teamBox {
  z-index: 99999999!important;
  max-width: 31.25rem;
  width: 96%;
  margin: auto;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0.625rem;
  max-height: 90%;
  overflow: auto;
  border-radius: 0.188rem;
}
#teamBox.details {
  max-width: 25rem;
}
#teamBox.details span {
  width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  float: left;
}
#teamBox .teamBox-caption-player {
    font-weight: 600;
    font-size: 140%;
    text-align:left;
    text-indent: 15px;
}
#LSscoringBox .player-row[data-team="FA"] .player-details-box:not(.hasStats) .player-stats,
#LSscoringBox .player-row[data-team="FA"] .player-details-box:not(.hasStats) .player-projected-score,
#LSscoringBox .player-row[data-team="FA"] .player-details-box:not(.hasStats) .player-live-score,
#LSscoringBox .player-row.bye .player-details-box:not(.hasStats) + .player-score-box .player-stats,
#LSscoringBox .player-row.bye .player-details-box:not(.hasStats) + .player-score-box .player-projected-score,
#LSscoringBox .player-row.bye .player-details-box:not(.hasStats) + .player-score-box .player-live-score {
    font-size: 0 !important;
    color: transparent !important;
}
#LSscoringBox .player-row.bye .game-info {
  font-size: 0.8rem;
}
#LSscoringBox .matchup-box .franchise-box span.inj_status {
  position: absolute;
  right: -0.1rem;
  border-radius: 50%;
  text-align: center;
  font-size: 0.6rem;
  line-height: 0.875rem;
  bottom: 0;
  height: 0.875rem;
  width: 0.875rem;
}
#LSscoringBox .matchup-box.head-to-head .franchise-box + .franchise-box span.inj_status {
  left: -0.1rem;
  right: auto;
}
#LSscoringBox .player-row[data-team="FA"] .player-details-box:not(.hasStats) + .player-score-box .player-projected-score {
    display: none !important;
}
#LSscoringBox .player-row.bye .player-details-box:not(.hasStats) + .player-score-box .player-live-score,
#LSscoringBox .player-row.bye .player-details-box:not(.hasStats) + .player-score-box .player-live-score {
  text-decoration: none!important;
  pointer-events: none!important;
}
#LSscoringBox .matchup-box.head-to-head .franchise-box +.franchise-box .franchise-pmr-wrap .players-playingMin,
#LSscoringBox .matchup-box.head-to-head .franchise-box +.franchise-box .franchise-pmr-wrap .players-playingMin-val {
  order: 0;
}
#LSscoringBox .matchup-box.head-to-head .franchise-box +.franchise-box .franchise-pmr-wrap .players-yetToPlayer,
#LSscoringBox .matchup-box.head-to-head .franchise-box +.franchise-box .franchise-pmr-wrap .players-yetToPlayer-val {
  order: 1;
}
#LSscoringBox .matchup-box.head-to-head .franchise-box +.franchise-box .franchise-pmr-wrap .players-playing,
#LSscoringBox .matchup-box.head-to-head .franchise-box +.franchise-box .franchise-pmr-wrap .players-playing-val {
  order: 2;
  border-right: 0;
}
#LSscoringBox .matchup-box .franchise-pmr-wrap {
  font-size: 1rem;
}
#LSscoringBox .matchupOver .franchise-pmr-wrap {
  display: none!important;
}
#LSscoringBox .waiting .player-score-box {
  pointer-events: none;
}
#LSscoringBox .waiting .player-score-box .player-live-score {
  pointer-events: none;
  text-decoration: none!important;
}
#LSscoringBox .lsStarterstotals {
  border-bottom: 0.5rem double transparent;
}

#LSscoringBox .last-div-end + div[class*="positionChange"] {
  display: none!important;
}
.players.no-lineups:before,
.players-bench.no-lineups:before {
  display: none;
}
#LSscoringBox .players .no-starters-message {
  font-size: 0.9rem;
}
.nfl-box-scroll-wrap .ls-nfl-team-img img {
  text-align: center;
  width:100%;
  height:100%;
  height: 1.375rem;
  width: 1.375rem;
}
.franchise-icon-scroll img {
  margin-right: 0.5rem;
  max-width: 13rem;
  max-height: 5rem;
}
#LSscoringBox .franchise-icon img {
  width: 100%;
  height:100%;
  max-width: 30rem;
  max-height: 12rem;
}
#LSscoringBox .head-to-head .player-live-score:after {
    content: "";
    min-width: 3.438rem;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    margin: 0 0.438rem;
}
#LSscoringBox .head-to-head .teamAway + .teamHome .player-live-score:after {
    left: 0;
    right: auto;
}
.failedLoad .matchup-box-scroll-wrap{
    display:none!important
}
.failedLoad #LSscoringBox{
    display:block!important;
    width:100%!important
}
.matchupRow .score_BYE{display:none!important}

body:has(#ScoreDetails[style*="position: fixed"]) #teamBox,
body:has(.scoredetailsWrap[style*="position: fixed"]) #teamBoxOverlay {
    display: none!important;
}
body:has(#ScoreDetails[style*="position: fixed"][style*="display: none"]) #teamBox[style*="display: block"],
body:has(.scoredetailsWrap[style*="position: fixed"][style*="display: none"]) #teamBoxOverlay[style*="display: block"] {
    display: block!important;
}
body:has(#MFLPlayerPopupOverlay[style*="display: block"]) #teamBoxOverlay[style*="display: block"],
body:has(#MFLPlayerPopupOverlay[style*="display: block"]) #teamBoxOverlay + #teamBox[style*="display: block"] {
    display: none!important;
}
#LSscoringBox .player-row.waiting .player-stats{display:none}


@media only screen and (max-width: 620px) {
  .franchise-icon-scroll img {
    max-width: 10rem;
    max-height: 3rem;
  }
  #LSscoringBox .head-to-head div.franchise-score span {
    font-size: 2rem;
    min-width: 1rem;
  }
  #LSscoringBox .matchup-box.head-to-head .franchise-box span.inj_status {
    font-size: 0.5rem;
    height: 0.62rem;
    width: 0.62rem;
    line-height: 0.62rem;
  }
  #LSscoringBox .head-to-head .player-name h3 {
    font-size: 0.688rem!important;
  }
  #LSscoringBox .head-to-head .player-team {
    display: none;
  }
  #LSscoringBox .head-to-head .player-projected-score {
    font-size: 0.65rem;
  }
  #LSscoringBox .head-to-head .franchise-name h2 {
    font-size: 1.15rem;
  }
  #LSscoringBox .head-to-head .player-score-box,
  #LSscoringBox .head-to-head .player-live-score:after {
    margin: 0 0.188rem;
    min-width: 2.5rem;
  }
  #LSscoringBox .head-to-head .player-image {
    max-width: 2rem;
    max-height: 2rem;
    margin: 0 0.2rem;
  }
  #LSscoringBox .head-to-head .player-position {
    border-radius: 0.188rem;
    width: 2rem;
    font-size: 0.5rem;
  }
  #LSscoringBox .head-to-head .player-image img {
    height: 2rem;
    width: 2rem;
  }
  #LSscoringBox .head-to-head .franchise-box .player-row.done div.player-image:before,
  #LSscoringBox .head-to-head .franchise-box .player-row.playing div.player-image:before {
    font-size: 0.62rem;
    height: 0.62rem;
    width: 0.62rem;
  }
  #LSscoringBox .head-to-head .player-row {
    flex-basis: 3.688rem;
  }
  #LSscoringBox .head-to-head .game-info > div,
  #LSscoringBox .head-to-head div[class*="game-time-"],
  #LSscoringBox .head-to-head .player-row.bye .game-info,
  #LSscoringBox .head-to-head .player-row[data-team="FA"] .game-info,
  #LSscoringBox .head-to-head .player-stats {
    font-size: 0.5rem;
  }
  #LSscoringBox .head-to-head .lsm_statusText,
  .franchise-score-scroll,
  #LSscoringBox .matchup-box.head-to-head .franchise-pmr-wrap,
  #LSscoringBox .matchup-box.head-to-head div.franchise-record,
  .matchup-box-scroll-wrap .matchupIsOver .singleMatch.greater-score .winnerMark:after,
  .matchup-box-scroll-wrap .single-matchup.matchupIsOver .greater-score .winnerMark:after,
  .matchup-box-scroll-wrap .matchupIsOver .greater-score .winnerMark:after,
  .matchup-box-scroll.matchupIsOver:has(#franchise_BYE) .teamOver.greater-score .winnerMark:after {
    font-size: 0.8rem;
  }
  #LSscoringBox .head-to-head .LsTotalsRow,
  #LSscoringBox .head-to-head .lsPPTotalsPts,
  #LSscoringBox .head-to-head .players .no-starters-message {
    font-size: 0.7rem;
  }
  #LSscoringBox .head-to-head .lsTotals {
    margin: 0 0.188rem;
    min-width: 2.5rem;
  }
  #LSscoringBox .head-to-head .lsTotalsDivPts,
  #LSscoringBox .head-to-head .player-live-score {
    font-size: 1rem;
  }
  .franchise-pp-scroll {
    font-size: 0.6rem;
  }
  #LSscoringBox .head-to-head div.franchise-record {
    font-size: 0.9rem;
  }
}
@media only screen and (max-width: 64em) {
  #LSscoringBox .head-to-head div.franchise-score span.ls_num_1 {
    display: none;
  }
}
@media only screen and (max-width:53em) {
  #LSscoringBox .head-to-head div.franchise-score span.ls_num_2 {
    display: none;
  }
}
@media only screen and (max-width:49em) {
  #LSscoringBox .head-to-head div.franchise-score span.ls_num_3 {
    display: none;
  }
}
@media only screen and (max-width:44em) {
  #LSscoringBox .head-to-head div.franchise-score span.ls_num_4 {
    display: none;
  }
}
@media only screen and (max-width:38em) {
  #LSscoringBox .head-to-head div.franchise-score span.ls_num_5 {
    display: none;
  }
}
@media only screen and (max-width: 32em) {
  #LSscoringBox .franchise-box {
    padding: 0.35rem;
    margin-right: 0.15rem;
  }
  #LSModuleSettings,
  .nfl-box-scroll-wrap,
  .matchup-box-scroll-wrap {
    padding: 0.35rem;
    margin-bottom: 0.35rem;
  }
  #LSModuleSettings {
    padding: 0.625rem 0.35rem;
  }
  #LSscoringBox .franchise-box + .franchise-box {
    margin: 0 0 0 0.15rem;
  }
  #LSscoringBox .head-to-head .playerPopupIcon[src*=".svg"] {
    height: 0.6rem!important;
  }
}
@media only screen and (max-width:28em) {
  #LSscoringBox .single-matchup div.franchise-score span.ls_num_1,
  #LSscoringBox .single-matchup div.franchise-score span.ls_num_2 {
    display: none;
  }
}
@media only screen and (max-width:24em) {
  #LSscoringBox .single-matchup div.franchise-score span.ls_num_3,
  #LSscoringBox .single-matchup div.franchise-score span.ls_num_4 {
    display: none;
  }
}
@media (min-width: 768px) {
    #LSscoringBox .head-to-head .teamAway + .teamHome .player-name,
    #LSscoringBox .head-to-head .teamAway + .teamHome .game-info,
    #LSscoringBox .head-to-head .teamAway + .teamHome div[class*="game-time-"],
    #LSscoringBox .head-to-head .teamAway + .teamHome .game-status {
        justify-content: right;
        text-align: right;
    }
    #LSscoringBox .head-to-head .teamAway + .teamHome .player-stats {
        text-align: right;
    }
    #LSscoringBox .head-to-head .teamAway + .teamHome .player-name h3 {
        order: 2;
        text-align: right;
    }
    #LSscoringBox .head-to-head .teamAway + .teamHome .player-team {
        order: 1;
        margin-left: 0;
    }
    #LSscoringBox .head-to-head .teamAway + .teamHome .player-name a {
        display: inline-flex;
        align-items: center;
        ga: 0.25em;
    }
    #LSscoringBox .head-to-head .teamAway + .teamHome .player-name a img.playerPopupIcon {
        order: -1;
        margin-left: 0 !important;
        margin-right: 8px !important;
    }
}
`;
LSMstyleAdd.innerHTML = LSMcssRules;
document.head.appendChild(LSMstyleAdd);