const FantasyTickerElement = document.querySelector(".fantasy_ticker_wrapper");
if (FantasyTickerElement)
    if (endWeek <= completedWeek || startWeek > liveScoringWeek) {
        const e = FantasyTickerElement.parentElement,
            a = `<div class="mobile-wrap fantasy_ticker_wrapper"><table align="center" cellspacing="1" class="homepagemodule report" id="fantasy_ticker_table"><caption><span>Fantasy Ticker</span></caption><tbody><tr>${endWeek <= completedWeek ? `<th>${year} MFL season has ended - Fantasy Ticker Disabled</th>` : ""}${startWeek > liveScoringWeek ? `<th>${year} MFL season has not started - Fantasy Ticker Disabled</th>` : ""}</tr></tbody></table></div>`;
        if (e.classList.contains("mobile-wrap")) {
            const r = document.createElement("div");
            r.innerHTML = a;
            const t = r.firstElementChild;
            e.replaceWith(t);
        } else {
            const i = document.createElement("div");
            i.innerHTML = a;
            const c = i.firstElementChild;
            FantasyTickerElement.replaceWith(c);
        }
    } else {
        var habTickerCount = 0,
            habTickerScoreboard = [],
            habTickerLoops = 3,
            habTickerIndexAdjustment = 0,
            habTickerRunning = !0,
            habTickerMondayNightCheck = !1,
            habTickerMaxLoops = 0,
            habTickerGlobalScoreCheck = 0;
        if (void 0 === habTickerDelay) var habTickerDelay = 3;
        if (void 0 === habTickerUseLiveScoringCaption) var habTickerUseLiveScoringCaption = !1;
        if (void 0 === habTickerHideTiesInRecord) var habTickerHideTiesInRecord = !1;
        if (void 0 === habTickerIconLogoNameAbbrev) var habTickerIconLogoNameAbbrev = 0;
        if (void 0 === preloaded_image) var preloaded_image = [];
        if (void 0 === typeof iconHeight) var iconHeight = "0";
        const s = document.createElement("div");
        (s.id = "tickerHframe"),
            (s.style.position = "absolute"),
            (s.style.top = "0.125rem"),
            (s.style.left = "0.125rem"),
            document.body.appendChild(s);
        const n = document.querySelector(".fantasy_ticker_wrapper");
        function getHabScoreClock(e, a, r) {
            var t = 3600 * leagueAttributes.MaxStarters;
            if (0 === e && 0 === a) var i = 3600;
            else i = 3600 * parseInt(r / t, 10);
            return 3600 === i
                ? "1st - 15:00"
                : 0 === i
                  ? "Final"
                  : i > 2700
                    ? "1st - " + formatHabDate(new Date(1e3 * (i - 2700)), "mm:ss")
                    : i > 1800
                      ? "2nd - " + formatHabDate(new Date(1e3 * (i - 1800)), "mm:ss")
                      : 2700 === i
                        ? "Halftime"
                        : i > 900
                          ? "3rd - " + formatHabDate(new Date(1e3 * (i - 900)), "mm:ss")
                          : "4th - " + formatHabDate(new Date(1e3 * i), "mm:ss");
        }
        function getTickerAbbrev(e) {
            var a = franchiseDatabase["fid_" + e].name,
                r = franchiseDatabase["fid_" + e].abbrev;
            if ((null === r && (r = ""), "" === r)) {
                var t = a.split(" ");
                if (t.length > 1) for (var i = 0; i < t.length; i++) r += t[i].substr(0, 1).toUpperCase();
                else r = a.substr(0, 5).toUpperCase();
            }
            return r;
        }
        function getTickerIconLogoNameAbbrev(e) {
            switch (habTickerIconLogoNameAbbrev) {
                case 0:
                default:
                    return "" !== franchiseDatabase["fid_" + e].icon
                        ? '<img src="' +
                              franchiseDatabase["fid_" + e].icon +
                              '" class="ticker_img ticker_icon" style="vertical-align:middle;max-height:' +
                              iconHeight +
                              (useREM ? "rem" : "px") +
                              '" title="' +
                              franchiseDatabase["fid_" + e].name +
                              '" />'
                        : "" !== franchiseDatabase["fid_" + e].logo
                          ? '<img src="' +
                            franchiseDatabase["fid_" + e].logo +
                            '" class="ticker_img ticker_logo" style="vertical-align:middle;max-height:' +
                            iconHeight +
                            (useREM ? "rem" : "px") +
                            '" title="' +
                            franchiseDatabase["fid_" + e].name +
                            '" />'
                          : franchiseDatabase["fid_" + e].name;
                case 1:
                    return "" !== franchiseDatabase["fid_" + e].logo
                        ? '<img src="' +
                              franchiseDatabase["fid_" + e].logo +
                              '" class="ticker_img ticker_logo" style="vertical-align:middle;max-height:' +
                              iconHeight +
                              (useREM ? "rem" : "px") +
                              '" title="' +
                              franchiseDatabase["fid_" + e].name +
                              '" />'
                        : "" !== franchiseDatabase["fid_" + e].icon
                          ? '<img src="' +
                            franchiseDatabase["fid_" + e].icon +
                            '" class="ticker_img ticker_icon" style="vertical-align:middle;max-height:' +
                            iconHeight +
                            (useREM ? "rem" : "px") +
                            '" title="' +
                            franchiseDatabase["fid_" + e].name +
                            '" />'
                          : franchiseDatabase["fid_" + e].name;
                case 2:
                    return franchiseDatabase["fid_" + e].name;
                case 3:
                    return getTickerAbbrev(e);
                case 4:
                    return "" !== franchiseDatabase["fid_" + e].icon
                        ? '<img src="' +
                              franchiseDatabase["fid_" + e].icon +
                              '" class="ticker_img ticker_icon" style="vertical-align:middle;max-height:' +
                              iconHeight +
                              (useREM ? "rem" : "px") +
                              '" title="' +
                              franchiseDatabase["fid_" + e].name +
                              '" />' +
                              franchiseDatabase["fid_" + e].name
                        : "" !== franchiseDatabase["fid_" + e].logo
                          ? '<img src="' +
                            franchiseDatabase["fid_" + e].logo +
                            '" class="ticker_img ticker_logo" style="vertical-align:middle;max-height:' +
                            iconHeight +
                            (useREM ? "rem" : "px") +
                            '" title="' +
                            franchiseDatabase["fid_" + e].name +
                            '" />' +
                            franchiseDatabase["fid_" + e].name
                          : franchiseDatabase["fid_" + e].name;
                case 5:
                    return "" !== franchiseDatabase["fid_" + e].icon
                        ? '<img src="' +
                              franchiseDatabase["fid_" + e].icon +
                              '" class="ticker_img ticker_icon" style="vertical-align:middle;max-height:' +
                              iconHeight +
                              (useREM ? "rem" : "px") +
                              '" title="' +
                              franchiseDatabase["fid_" + e].name +
                              '" />' +
                              getTickerAbbrev(e)
                        : "" !== franchiseDatabase["fid_" + e].logo
                          ? '<img src="' +
                            franchiseDatabase["fid_" + e].logo +
                            '" class="ticker_img ticker_logo" style="vertical-align:middle;max-height:' +
                            iconHeight +
                            (useREM ? "rem" : "px") +
                            '" title="' +
                            franchiseDatabase["fid_" + e].name +
                            '" />' +
                            getTickerAbbrev(e)
                          : franchiseDatabase["fid_" + e].name;
                case 6:
                    return "" !== franchiseDatabase["fid_" + e].logo
                        ? '<img src="' +
                              franchiseDatabase["fid_" + e].logo +
                              '" class="ticker_img ticker_logo" style="vertical-align:middle;max-height:' +
                              iconHeight +
                              (useREM ? "rem" : "px") +
                              '" title="' +
                              franchiseDatabase["fid_" + e].name +
                              '" />' +
                              franchiseDatabase["fid_" + e].name
                        : "" !== franchiseDatabase["fid_" + e].icon
                          ? '<img src="' +
                            franchiseDatabase["fid_" + e].icon +
                            '" class="ticker_img ticker_icon" style="vertical-align:middle;max-height:' +
                            iconHeight +
                            (useREM ? "rem" : "px") +
                            '" title="' +
                            franchiseDatabase["fid_" + e].name +
                            '" />' +
                            franchiseDatabase["fid_" + e].name
                          : franchiseDatabase["fid_" + e].name;
                case 7:
                    return "" !== franchiseDatabase["fid_" + e].logo
                        ? '<img src="' +
                              franchiseDatabase["fid_" + e].logo +
                              '" class="ticker_img ticker_logo" style="vertical-align:middle;max-height:' +
                              iconHeight +
                              (useREM ? "rem" : "px") +
                              '" title="' +
                              franchiseDatabase["fid_" + e].name +
                              '" />' +
                              getTickerAbbrev(e)
                        : "" !== franchiseDatabase["fid_" + e].icon
                          ? '<img src="' +
                            franchiseDatabase["fid_" + e].icon +
                            '" class="ticker_img ticker_icon" style="vertical-align:middle;max-height:' +
                            iconHeight +
                            (useREM ? "rem" : "px") +
                            '" title="' +
                            franchiseDatabase["fid_" + e].name +
                            '" />' +
                            getTickerAbbrev(e)
                          : franchiseDatabase["fid_" + e].name;
            }
        }
        function doTickerTables(e, a, r) {
            switch (r) {
                case 1:
                    var t =
                        '<a href="' +
                        baseURLDynamic +
                        "/" +
                        year +
                        "/live_scoring_summary?L=" +
                        league_id +
                        '" target="livescoring" class="tickerheader">Scoreboard - Week #' +
                        a +
                        "</a>";
                    habTickerIndexAdjustment = 0;
                    break;
                case 2:
                    if (0 === completedWeek) return !1;
                    t =
                        '<a href="' +
                        baseURLDynamic +
                        "/" +
                        year +
                        "/weekly?L=" +
                        league_id +
                        "&W=" +
                        a +
                        '" target="weeklyresults" class="tickerheader">Week #' +
                        a +
                        " Final Scores</a>";
                    habTickerIndexAdjustment = e.length;
                    break;
                case 3:
                    t =
                        '<a href="' +
                        baseURLDynamic +
                        "/" +
                        year +
                        "/weekly?L=" +
                        league_id +
                        "&W=" +
                        a +
                        '" target="weeklyresults" class="tickerheader">Week #' +
                        a +
                        " Games</a>";
                    break;
                case 4:
                    t =
                        '<a href="' +
                        baseURLDynamic +
                        "/" +
                        year +
                        "/options?L=" +
                        league_id +
                        '&O=22" target="weeklyresults" class="tickerheader">Week #' +
                        a +
                        " Games</a>";
                    (habTickerScoreboard[0] =
                        '<table align="center" border="0" class="tickerinnertable" style="border-collapse: collapse;">'),
                        (habTickerScoreboard[0] += '<tr><th colspan="2" class="tickerheader">' + t + "</th></tr>"),
                        (habTickerScoreboard[0] +=
                            '<tr><td colspan="2" class="tickerteam">No Games Scheduled</td></tr>'),
                        (habTickerScoreboard[0] += '<tr><td colspan="2" class="tickerteam">&nbsp;</td></tr>'),
                        (habTickerScoreboard[0] += '<tr><td colspan="2" class="tickerteam">&nbsp;</td></tr>'),
                        (habTickerScoreboard[0] += "</table>"),
                        (habTickerIndexAdjustment = 1);
                    break;
                case 5:
                    t =
                        '<a href="' +
                        baseURLDynamic +
                        "/" +
                        year +
                        "/options?L=" +
                        league_id +
                        '&O=22" target="weeklyresults" class="tickerheader">Week #' +
                        a +
                        " Games</a>";
                    (habTickerScoreboard[habTickerIndexAdjustment] =
                        '<table align="center" border="0" class="tickerinnertable" style="border-collapse: collapse;">'),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><th colspan="2" class="tickerheader">' + t + "</th></tr>"),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><td colspan="2" class="tickerteam">No Games Scheduled</td></tr>'),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><td colspan="2" class="tickerteam">&nbsp;</td></tr>'),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><td colspan="2" class="tickerteam">&nbsp;</td></tr>'),
                        (habTickerScoreboard[habTickerIndexAdjustment] += "</table>");
                    break;
                case 6:
                    t =
                        '<a href="' +
                        baseURLDynamic +
                        "/" +
                        year +
                        "/options?L=" +
                        league_id +
                        '&O=22" target="weeklyresults" class="tickerheader">Week #' +
                        a +
                        " Games</a>";
                    (habTickerScoreboard[habTickerIndexAdjustment] =
                        '<table align="center" border="0" class="tickerinnertable" style="border-collapse: collapse;">'),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><th colspan="2" class="tickerheader">' + t + "</th></tr>"),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><td colspan="2" class="tickerteam">No Games Scheduled</td></tr>'),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><td colspan="2" class="tickerteam">&nbsp;</td></tr>'),
                        (habTickerScoreboard[habTickerIndexAdjustment] +=
                            '<tr><td colspan="2" class="tickerteam">&nbsp;</td></tr>'),
                        (habTickerScoreboard[habTickerIndexAdjustment] += "</table>");
            }
            for (var i = 0; i < e.length; i++) {
                var c = e[i].road[0],
                    s = e[i].home[0];
                if ("BYE" !== c && "BYE" !== s) {
                    if ("AVG" === c) var n = "Average";
                    else n = franchiseDatabase["fid_" + c].name;
                    if ("AVG" === s) var o = "Average";
                    else o = franchiseDatabase["fid_" + s].name;
                    if (
                        ((n = n.replace(/'/g, "&rsquo;")),
                        (o = o.replace(/'/g, "&rsquo;")),
                        "Average" === n || "Average" === o)
                    )
                        var l = getHabAverageScore(e);
                    var d =
                            '<a href="' +
                            baseURLDynamic +
                            "/" +
                            year +
                            "/options?L=" +
                            league_id +
                            "&F=" +
                            c +
                            '&O=07" target="franchisepage" border="0" class="tickerteam" title="' +
                            n +
                            '" style="text-decoration: none;">',
                        h =
                            '<a href="' +
                            baseURLDynamic +
                            "/" +
                            year +
                            "/options?L=" +
                            league_id +
                            "&F=" +
                            s +
                            '&O=07" target="franchisepage" border="0" class="tickerteam" title="' +
                            o +
                            '" style="text-decoration: none;">',
                        b = getTickerIconLogoNameAbbrev(c),
                        k = getTickerIconLogoNameAbbrev(s);
                    switch (r) {
                        case 1:
                            var m = getHabScoreClock(
                                    parseInt(e[i].road[1], 10),
                                    parseInt(e[i].home[1], 10),
                                    e[i].gameSecondsRemaining
                                ),
                                g =
                                    '<a href="' +
                                    baseURLDynamic +
                                    "/" +
                                    year +
                                    "/ajax_ls?L=" +
                                    league_id +
                                    '" target="livescoring" class="tickerclock">' +
                                    m +
                                    "</a>",
                                p = parseFloat(e[i].road[1], 10),
                                f = parseFloat(e[i].home[1], 10);
                            (p = p.toFixed(precision)),
                                (f = f.toFixed(precision)),
                                "Average" === n && (p = l.toFixed(precision)),
                                "Average" === o && (f = l.toFixed(precision));
                            var u = "",
                                T = "",
                                y = i;
                            break;
                        case 2:
                            (g =
                                '<a href="' +
                                baseURLDynamic +
                                "/" +
                                year +
                                "/options?L=" +
                                league_id +
                                '&O=22" target="weeklyresults" class="tickerclock">Final</a>'),
                                (p = parseFloat(e[i].road[1], 10)),
                                (f = parseFloat(e[i].home[1], 10));
                            (p = p.toFixed(precision)),
                                (f = f.toFixed(precision)),
                                "Average" === n && (p = l.toFixed(precision)),
                                "Average" === o && (f = l.toFixed(precision));
                            (u = ""), (T = ""), (y = i);
                            break;
                        case 3:
                            g =
                                '<a href="' +
                                baseURLDynamic +
                                "/" +
                                year +
                                "/options?L=" +
                                league_id +
                                "&WEEK=" +
                                a +
                                '&O=06" target="livescoring" class="tickerclock">Preview</a>';
                            if (habTickerHideTiesInRecord)
                                (p =
                                    "(" +
                                    habMFLStandingsData[e[i].road[0]].win +
                                    "-" +
                                    reportStandingsFid_ar[e[i].road[0]].loss +
                                    ")"),
                                    (f =
                                        "(" +
                                        reportStandingsFid_ar[e[i].home[0]].win +
                                        "-" +
                                        reportStandingsFid_ar[e[i].home[0]].loss +
                                        ")");
                            else
                                (p =
                                    "(" +
                                    reportStandingsFid_ar[e[i].road[0]].win +
                                    "-" +
                                    reportStandingsFid_ar[e[i].road[0]].loss +
                                    "-" +
                                    reportStandingsFid_ar[e[i].road[0]].tie +
                                    ")"),
                                    (f =
                                        "(" +
                                        reportStandingsFid_ar[e[i].home[0]].win +
                                        "-" +
                                        reportStandingsFid_ar[e[i].home[0]].loss +
                                        "-" +
                                        reportStandingsFid_ar[e[i].home[0]].tie +
                                        ")");
                            void 0 === p && (p = "n/a"), void 0 === f && (f = "n/a");
                            (u = e[i].road[3]), (T = e[i].home[3]);
                            (u =
                                null === u || 0 === parseFloat(u, 10)
                                    ? ""
                                    : "<span class='tickerspread' style='vertical-align:middle;padding:0 0.625rem;text-align:center'>" +
                                      parseFloat(u, 10).toFixed(precision) +
                                      "</span>"),
                                (T =
                                    null === T || 0 === parseFloat(T, 10)
                                        ? ""
                                        : "<span class='tickerspread' style='vertical-align:middle;padding:0 0.625rem;text-align:center'>" +
                                          parseFloat(T, 10).toFixed(precision) +
                                          "</span>");
                            y = i + habTickerIndexAdjustment;
                    }
                    (habTickerScoreboard[y] =
                        '<table align="center" cellspacing="0" class="tickerinnertable" style="border-collapse: collapse;">'),
                        (habTickerScoreboard[y] +=
                            '<tbody><tr><th colspan="2" class="tickerheader">' + t + "</th></tr>"),
                        (habTickerScoreboard[y] +=
                            '<tr><td align="left" class="tickerteam" style="padding: 0.313rem 0;vertical-align:middle;width:90%;text-align:left">' +
                            d +
                            b +
                            u +
                            '</a></td><td align="right" class="tickerscore" style="vertical-align:middle;white-space:nowrap;padding:0 0.625rem;text-align:center">' +
                            p +
                            "</td></tr>"),
                        (habTickerScoreboard[y] +=
                            '<tr><td align="left" class="tickerteam" style="padding: 0.313rem 0;vertical-align:middle;width:90%;text-align:left">' +
                            h +
                            k +
                            T +
                            '</a></td><td align="right" class="tickerscore" style="vertical-align:middle;white-space:nowrap;padding:0 0.625rem;text-align:center">' +
                            f +
                            "</td></tr>"),
                        (habTickerScoreboard[y] +=
                            '<tr><td colspan="2" align="center" class="tickerclock">' + g + "</td></tr>"),
                        (habTickerScoreboard[y] += "</tbody></table>");
                }
            }
            2 !== r &&
                ((habTickerLoops = parseInt(120 / habTickerScoreboard.length / habTickerDelay, 10) + 1),
                displayTicker());
        }
        function displayTicker() {
            try {
                for (
                    ;
                    void 0 === habTickerScoreboard[habTickerCount] && habTickerCount < habTickerScoreboard.length - 1;

                )
                    habTickerCount++;
                if (void 0 !== habTickerScoreboard[habTickerCount]) {
                    const e = document.getElementById("fantasy_ticker");
                    if (e) e.innerHTML = habTickerScoreboard[habTickerCount];
                    else {
                        const e = document.querySelector(".fantasy_ticker_wrapper");
                        e &&
                            (e.innerHTML = `\n                        <table align="center" cellspacing="1" class="homepagemodule report" id="fantasy_ticker_table">\n                            <caption><span>Fantasy Ticker</span></caption>\n                            <tbody>\n                                <tr>\n                                    <td style="margin: 0; padding: 0">\n                                        <div id="fantasy_ticker">${habTickerScoreboard[habTickerCount]}</div>\n                                    </td>\n                                </tr>\n                            </tbody>\n                        </table>`);
                    }
                }
                habTickerCount < habTickerScoreboard.length - 1
                    ? habTickerCount++
                    : ((habTickerCount = 0), habTickerLoops--),
                    habTickerLoops > 0 ? setTimeout(displayTicker, 1e3 * habTickerDelay) : getHabTickerMode();
            } catch (e) {}
        }
        function getHabTickerMode() {
            if (((habTickerCount = 0), ++habTickerMaxLoops < 31))
                completedWeek === liveScoringWeek && completedWeek + 1 <= endWeek
                    ? doBetweenGameTickerFunctions()
                    : doLiveTickerFunctions();
            else {
                const e =
                    '<table align="center" cellspacing="0" class="tickerinnertable" style="position: relative; z-index: 1000;"><tr><td class="tickerteam" style="text-align:center;vertical-align:middle;width:100%;">Ticker halted due to inactivity<br /><a href="#TickerRestart" onclick="habTickerMaxLoops=0; getHabTickerMode();" style="text-decoration: underline;">Click to Restart</a></td></tr></table>';
                FantasyTickerElement && (FantasyTickerElement.innerHTML = e);
            }
        }
        function doLiveTickerFunctions() {
            const e = [],
                a = document.querySelector("#tickerHframe");
            a &&
                ((a.innerHTML = `<iframe src="${baseURLDynamic}/${year}/live_scoring_summary?L=${league_id}&App=tic" style="width: 0; height: 0; border: 0;"></iframe>`),
                (a.innerHTML = ""));
            let r = liveScoringWeek;
            function processLiveScoring(a) {
                const t = a && a.liveScoring;
                if (!t || !t.matchup) {
                    const e = document.querySelector(".fantasy_ticker_wrapper");
                    return void (e && e.remove());
                }
                const i = Array.isArray(t.matchup) ? t.matchup : [t.matchup];
                for (let a = 0; a < i.length; a++) {
                    const r = i[a];
                    if (!r || !r.franchise || r.franchise.length < 2) continue;
                    const t = r.franchise,
                        c = [
                            t[0].id,
                            t[0].score,
                            t[0].gameSecondsRemaining || "0",
                            t[0].playersYetToPlay,
                            t[0].playersCurrentlyPlaying,
                        ],
                        s = [
                            t[1].id,
                            t[1].score,
                            t[1].gameSecondsRemaining || "0",
                            t[1].playersYetToPlay,
                            t[1].playersCurrentlyPlaying,
                        ];
                    0 === parseInt(c[3], 10) && 0 === parseInt(c[4], 10) && (c[2] = "0"),
                        0 === parseInt(s[3], 10) && 0 === parseInt(s[4], 10) && (s[2] = "0"),
                        (e[a] = []),
                        (e[a].road = c),
                        (e[a].home = s),
                        (e[a].gameSecondsRemaining = parseInt(c[2], 10) + parseInt(s[2], 10));
                }
                0 === e.length ? doTickerTables(e, r, 6) : doTickerTables(e, r, 1);
            }
            liveScoringWeek >= endWeek && (r = endWeek);
            if (r === liveScoringWeek && liveScoringLiveWeek && liveScoringLiveWeek.liveScoring) {
                let e;
                (e =
                    "function" == typeof structuredClone
                        ? structuredClone(liveScoringLiveWeek)
                        : JSON.parse(JSON.stringify(liveScoringLiveWeek))),
                    processLiveScoring(e);
            } else {
                const e = `${baseURLDynamic}/${year}/export?TYPE=liveScoring&L=${league_id}&W=${r}&JSON=1&rand=${Math.random()}`;
                fetch(e, { method: "GET", headers: { "Content-Type": "application/json" } })
                    .then((e) => e.json())
                    .then((e) => {
                        processLiveScoring(e);
                    })
                    .catch((e) => {
                        console.error("Error fetching live scoring data:", e);
                    });
            }
        }
        function doBetweenGameTickerFunctions() {
            const e = completedWeek,
                a = [],
                r = reportWeeklyResults_ar[`w_${e}`];
            habTickerGlobalScoreCheck = 0;
            let t = [];
            if (Array.isArray(r.weeklyResults.matchup)) t = r.weeklyResults;
            else {
                const e = { matchup: [] };
                (e.matchup[0] = r.weeklyResults.matchup), (t = e);
            }
            for (let e = 0; e < t.matchup.length; e++) {
                const r = t.matchup[e].franchise,
                    i = [r[0].id, r[0].score, r[0].starters, r[0].spread],
                    c = [r[1].id, r[1].score, r[1].starters, r[1].spread];
                (habTickerGlobalScoreCheck += parseInt(i[1], 10) + parseInt(c[1], 10)),
                    (a[e] = []),
                    (a[e].road = i),
                    (a[e].home = c);
            }
            if (
                (0 === a.length
                    ? doTickerTables(a, e, 4)
                    : 0 !== habTickerGlobalScoreCheck
                      ? doTickerTables(a, e, 2)
                      : ((habTickerMondayNightCheck = !0), doLiveTickerFunctions()),
                !habTickerMondayNightCheck)
            ) {
                const r = e + 1,
                    t = reportWeeklyResults_ar[`w_${r}`];
                habTickerGlobalScoreCheck = 0;
                let i = [];
                if (Array.isArray(t.weeklyResults.matchup)) i = t.weeklyResults;
                else {
                    const e = { matchup: [] };
                    (e.matchup[0] = t.weeklyResults.matchup), (i = e);
                }
                for (let e = 0; e < i.matchup.length; e++) {
                    const r = i.matchup[e].franchise,
                        t = [r[0].id, r[0].score, r[0].starters, r[0].spread],
                        c = [r[1].id, r[1].score, r[1].starters, r[1].spread];
                    (habTickerGlobalScoreCheck += parseInt(t[1], 10) + parseInt(c[1], 10)),
                        (a[e] = []),
                        (a[e].road = t),
                        (a[e].home = c);
                }
                0 === a.length ? doTickerTables(a, r, 5) : doTickerTables(a, r, 3);
            }
        }
        n &&
            (n.innerHTML =
                '<table align="center" cellspacing="1" class="homepagemodule report" id="fantasy_ticker_table"><caption><span>Fantasy Ticker</span></caption><tbody><tr><td style="margin: 0; padding: 0"><div id="fantasy_ticker"></div></td></tr></tbody></table>');
        try {
            window.MFLGlobalCache.onReady(() => {
                getHabTickerMode();
            });
        } catch (o) {}
    }
