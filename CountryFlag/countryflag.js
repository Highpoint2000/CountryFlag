(() => {
/////////////////////////////////////////////////////////////
///                                                       ///
///  COUNTRY FLAG PLUGIN FOR FM-DX-WEBSERVER (V1.0)       ///
///                                                       /// 
///  by Highpoint               last update: 03.12.2025   ///
///                                                       ///
/////////////////////////////////////////////////////////////

    
    // --- Visual Settings ---
    const blurAmount =           '5px';  // Blur strength (e.g. '5px', '0px' for sharp)
    const opacity =              '0.30'; // Opacity of the background (0.0 - 1.0)
    const animationEnabled =     true;   // Enable/Disable waving animation (true/false)
    const waveStrength =         3.0;    // Intensity of the wave (0.5 = subtle, 3.0 = strong)
	
	//////////////////////////////////////////////////////////////////////////////////////
	
	// --- Plugin Version ---
    const plugin_version =       '1.0';
    
    // --- Sources ---
    const countryListUrl =       'https://tef.noobish.eu/logos/scripts/js/countryList.js';

    // --- Update Settings ---
    const checkForUpdates =      true;
    const pluginName =           'Country Flag';
    const pluginUpdateUrl =      'https://raw.githubusercontent.com/Highpoint2000/CountryFlag/refs/heads/main/CountryFlag/countryflag.js';
    const pluginHomepageUrl =    'https://github.com/Highpoint2000/CountryFlag/releases';


    console.log(`Plugin loaded: ${pluginName} v${plugin_version} (Multi-Word Support)`);

    // --- CACHE SPEICHER ---
    const imageCache = {};

    // --- CSS ---
    function injectStyles() {
        const styleId = 'station-flag-bg-styles';
        if (document.getElementById(styleId)) return;

        const s = waveStrength;
        const skew = 0.5 * s;
        const scaleBase = 1.1;       
        const scaleYVar = 0.05 * s;  
        
        const animFlag  = animationEnabled ? 'waveFlag 8s ease-in-out infinite alternate' : 'none';
        const animLight = animationEnabled ? 'waveLight 6s linear infinite' : 'none'; 
        const lightDisplay = animationEnabled ? 'block' : 'none';

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .station-flag-bg-layer {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                z-index: 0; 
                pointer-events: none;
                overflow: hidden;
                opacity: ${opacity};
                transition: opacity 0.2s ease-in-out;
                will-change: opacity; 
                transform: translateZ(0); 
            }

            .station-flag-image {
                width: 100%;
                height: 100%;
                background-size: 100% 100% !important;
                background-position: center center;
                background-repeat: no-repeat;
                filter: blur(${blurAmount});
                animation: ${animFlag};
                transform-origin: center center;
                transform: scale(${scaleBase}); 
                will-change: transform; 
            }

            .station-flag-overlay {
                display: ${lightDisplay};
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: linear-gradient(
                    120deg, 
                    rgba(255,255,255,0) 0%, 
                    rgba(255,255,255,0.15) 50%, 
                    rgba(255,255,255,0) 100%
                );
                background-size: 400% 100%;
                animation: ${animLight};
                mix-blend-mode: overlay;
            }

            @keyframes waveFlag {
                0%   { transform: scale(${scaleBase}, ${scaleBase}) skewY(0deg); }
                25%  { transform: scale(${scaleBase}, ${scaleBase + scaleYVar}) skewY(${skew}deg); }
                50%  { transform: scale(${scaleBase}, ${scaleBase + scaleYVar}) skewY(0deg); }
                75%  { transform: scale(${scaleBase}, ${scaleBase}) skewY(-${skew}deg); }
                100% { transform: scale(${scaleBase}, ${scaleBase}) skewY(0deg); }
            }

            @keyframes waveLight {
                0% { background-position: 100% 0; }
                100% { background-position: -100% 0; }
            }

            .panel-33.station-info-panel { 
                position: relative !important; 
                overflow: hidden !important; 
                transform: translate3d(0,0,0); 
            }

            #data-station-container { 
                position: relative; 
                z-index: 2; 
                text-shadow: 0 1px 4px rgba(0,0,0,0.9);
                transform: translateZ(0); 
            }
        `;
        document.head.appendChild(style);
    }

    // --- DOM ---
    function prepareDom() {
        const stationContainer = document.getElementById('data-station-container');
        if (!stationContainer) return null;
        const panel = stationContainer.closest('.panel-33');
        if (!panel) return null;
        panel.classList.add('station-info-panel');
        
        let bgWrapper = document.getElementById('station-flag-bg');
        if (!bgWrapper) {
            bgWrapper = document.createElement('div');
            bgWrapper.id = 'station-flag-bg';
            bgWrapper.className = 'station-flag-bg-layer';
            
            const imgDiv = document.createElement('div');
            imgDiv.id = 'station-flag-img';
            imgDiv.className = 'station-flag-image';
            
            const lightDiv = document.createElement('div');
            lightDiv.className = 'station-flag-overlay';

            bgWrapper.appendChild(imgDiv);
            bgWrapper.appendChild(lightDiv);
            
            panel.insertBefore(bgWrapper, panel.firstChild);
        }
        return document.getElementById('station-flag-img');
    }

    // --- URL & CACHE LOGIC ---
    function getFlagUrl(ituRawText) {
        if (typeof countryList === 'undefined' || !Array.isArray(countryList)) return null;
        
        // 1. String zerlegen: Komma und Leerzeichen als Trenner
        // Filter entfernt leere Einträge, falls doppelte Leerzeichen vorkommen.
        // Beispiel: "Kentucky, USA" -> ["Kentucky", "USA"]
        const parts = ituRawText.split(/[\s,]+/).filter(s => s.length > 0);
        
        let countryData = null;
        let matchedPart = '';

        // 2. Teile einzeln prüfen
        for (const part of parts) {
            const searchCode = part.toUpperCase();
            const match = countryList.find(country => country.itu_code === searchCode);
            
            if (match) {
                countryData = match;
                matchedPart = searchCode;
                break; // Sobald wir einen Treffer haben, hören wir auf
            }
        }

        // 3. Ergebnis auswerten
        let url = null;
        if (countryData) {
            console.log(`[${pluginName}] ITU Input: "${ituRawText}" -> Matched: "${matchedPart}" -> Country: ${countryData.country_code}`);

            if (countryData.country_code && countryData.country_code !== '') {
                url = `https://flagcdn.com/w640/${countryData.country_code.toLowerCase()}.png`;
            } else {
                url = `https://tef.noobish.eu/logos/images/${matchedPart}.png`;
            }
        } else {
            console.log(`[${pluginName}] ITU Input: "${ituRawText}" -> No matching country found in parts: [${parts.join(', ')}]`);
        }

        if (url) {
            preloadImage(url);
        }
        
        return url;
    }

    function preloadImage(url) {
        if (!imageCache[url]) {
            const img = new Image();
            img.src = url;
            imageCache[url] = img;
        }
    }

    // --- UPDATE LOGIC ---
    let lastValidItu = '';

    function updateFlagBackground() {
        const ituElement = document.getElementById('data-station-itu');
        if (!ituElement) return;

        const imgElement = prepareDom();
        if (!imgElement) return;
        
        const wrapper = document.getElementById('station-flag-bg');

        let ituCode = ituElement.innerText.trim();

        const invalidCodes = ['', '?', '-', 'ITU', 'itu'];
        if (!ituCode || invalidCodes.includes(ituCode)) {
            wrapper.style.opacity = '0';
            lastValidItu = '';
            return;
        }

        if (ituCode !== lastValidItu) {
            // getFlagUrl enthält jetzt die Logik zum Splitten und Finden
            const flagUrl = getFlagUrl(ituCode);
            
            if (flagUrl) {
                imgElement.style.backgroundImage = `url('${flagUrl}')`;
                wrapper.style.opacity = opacity; 
                lastValidItu = ituCode;
            } else {
                wrapper.style.opacity = '0';
            }
        } else if (wrapper.style.opacity === '0') {
             wrapper.style.opacity = opacity; 
        }
    }

    function clearBackgroundAndText() {
        const wrapper = document.getElementById('station-flag-bg');
        if (wrapper) {
            wrapper.style.opacity = '0';
        }
        lastValidItu = '';

        const ituElement = document.getElementById('data-station-itu');
        if (ituElement) {
            ituElement.innerText = '';
        }
    }

    // ---------------------------------------------------------
    // Function for update notification in /setup
    // ---------------------------------------------------------
    function checkUpdate(pluginName, urlUpdateLink, urlFetchLink) {
        const rawPath = window.location.pathname || "/";
        const path = rawPath.replace(/\/+$/, "") || "/";
        const isSetupPath = path.endsWith("/setup") || path.endsWith("/setup.php");

        console.log(`[${pluginName}] Checking updates... (Current: ${plugin_version})`);

        async function fetchRemoteVersion() {
            try {
                const noCacheUrl = `${urlFetchLink}?t=${Date.now()}`;
                const response = await fetch(noCacheUrl, { cache: "no-store" });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const text = await response.text();
                const lines = text.split("\n");
                let remoteVersion = null;

                const versionRegex = /(?:const|let|var)\s+plugin_version\s*=\s*['"]([^'"]+)['"]/;
                
                for (let i = 0; i < Math.min(lines.length, 50); i++) {
                    const match = lines[i].match(versionRegex);
                    if (match) {
                        remoteVersion = match[1];
                        break;
                    }
                }
                
                return remoteVersion || "Unknown";
            } catch (error) {
                console.warn(`[${pluginName}] Update check failed:`, error);
                return null;
            }
        }

        fetchRemoteVersion().then(newVersion => {
            if (!newVersion || newVersion === "Unknown") return;

            if (newVersion !== plugin_version) {
                console.log(`[${pluginName}] Update available! ${plugin_version} -> ${newVersion}`);

                if (isSetupPath) {
                    setupNotify(plugin_version, newVersion, pluginName, urlUpdateLink);
                }
            } else {
                console.log(`[${pluginName}] Up to date.`);
            }
        });

        function setupNotify(currentVer, newVer, name, link) {
            const pluginSettings = document.getElementById("plugin-settings");
            if (pluginSettings) {
                const msg = `<a href="${link}" target="_blank" style="font-weight:bold; color:#ff4444;">` +
                            `[${name}] Update available: ${currentVer} &rarr; ${newVer}</a><br>`;
                
                if (pluginSettings.innerHTML.includes("No plugin settings")) {
                    pluginSettings.innerHTML = msg;
                } else {
                    pluginSettings.innerHTML += msg;
                }
            }

            const updateIcon = document.querySelector(".wrapper-outer #navigation .sidenav-content .fa-puzzle-piece") ||
                               document.querySelector(".sidenav-content");

            if (updateIcon) {
                if(!updateIcon.parentNode.querySelector('.update-dot')) {
                    const redDot = document.createElement("span");
                    redDot.className = "update-dot"; 
                    redDot.style.cssText = `
                        display: block; width: 12px; height: 12px; 
                        border-radius: 50%; background-color: #FE0830; 
                        margin-left: 82px; margin-top: -12px; position: absolute;
                    `;
                    updateIcon.appendChild(redDot);
                }
            }
        }
    }

    // --- INIT ---
    function startPlugin() {
        injectStyles();

        const freqNode = document.getElementById('data-frequency') || document.getElementById('commandinput');
        if (freqNode) {
            let lastFreq = freqNode.innerText || freqNode.value;
            const freqObserver = new MutationObserver(() => {
                const currentFreq = freqNode.innerText || freqNode.value;
                if (currentFreq !== lastFreq) {
                    lastFreq = currentFreq;
                    clearBackgroundAndText();
                }
            });
            freqObserver.observe(freqNode, { childList: true, characterData: true, subtree: true, attributes: true });
        }

        const ituNode = document.getElementById('data-station-itu');
        if (ituNode) {
            const ituObserver = new MutationObserver(() => {
                updateFlagBackground();
            });
            ituObserver.observe(ituNode, { childList: true, characterData: true, subtree: true });
            
            updateFlagBackground();
        }

        // --- TRIGGER UPDATE CHECK ---
        if (checkForUpdates) {
            checkUpdate(pluginName, pluginHomepageUrl, pluginUpdateUrl);
        }
    }

    function waitForResources() {
        let attempts = 0;
        function check() {
            if (typeof countryList !== 'undefined' && Array.isArray(countryList) && countryList.length > 0) {
                startPlugin();
            } else {
                attempts++;
                if (attempts < 30) {
                    setTimeout(check, 100);
                } else {
                    if (typeof countryList === 'undefined') {
                         $.getScript(countryListUrl) 
                            .done(() => { startPlugin(); })
                            .fail(() => { console.error("Failed to load countryList"); });
                    } else {
                        startPlugin();
                    }
                }
            }
        }
        check();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForResources);
    } else {
        waitForResources();
    }

})();