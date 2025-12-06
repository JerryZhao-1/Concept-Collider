import { SynthesisResult, DemoResult, ExplorationResult } from "../types";

export interface SampleDefinition extends SynthesisResult {
    keys: [string, string];
    imageFilename: string;
    demoHtml?: string;
}

const SOUNDSCAPE_DEMO = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soundscape Ecology Demo</title>
    <style>
        :root {
            --bg: #0f111a;
            --panel: #1a1d2b;
            --bio: #00ff9d;    /* Birds/Insects */
            --anthro: #ff2a6d; /* Machinery */
            --geo: #00a8ff;    /* Rain/Wind */
            --text: #c0c5d0;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            transition: background-color 1s;
        }

        .container { max-width: 900px; width: 100%; }

        /* --- DASHBOARD LAYOUT --- */
        .dashboard {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 20px;
        }

        .card {
            background: var(--panel);
            padding: 20px;
            border-radius: 10px;
            border-left: 3px solid #555;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
        }

        h2 { margin-top: 0; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 10px;}

        /* --- SPECTROGRAM VISUALIZER --- */
        #spectrogram {
            width: 100%;
            height: 200px;
            background: #000;
            position: relative;
            overflow: hidden; 
            border: 1px solid #333;
            display: flex;
            align-items: flex-end;
        }
        
        .bar {
            flex: 1;
            margin: 0 1px;
            background: #333;
            transition: height 0.1s, background-color 0.2s;
            position: relative;
        }

        /* --- CONTROLS --- */
        .control-group { margin-bottom: 15px; }
        label { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px;}
        
        input[type="range"] {
            width: 100%;
            background: #333;
            height: 6px;
            border-radius: 5px;
            outline: none;
            -webkit-appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px; height: 16px; border-radius: 50%; cursor: pointer;
        }

        #bio-slider::-webkit-slider-thumb { background: var(--bio); }
        #anthro-slider::-webkit-slider-thumb { background: var(--anthro); }
        #geo-slider::-webkit-slider-thumb { background: var(--geo); }
        #time-slider::-webkit-slider-thumb { background: #fff; }

        /* --- STATUS BOX --- */
        .status-box {
            padding: 15px;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            font-size: 0.9rem;
            margin-top: 20px;
        }
        .healthy { border: 1px solid var(--bio); color: var(--bio); background: rgba(0,255,157,0.1); }
        .danger { border: 1px solid var(--anthro); color: var(--anthro); background: rgba(255,42,109,0.1); animation: blink 1s infinite; }
        .masked { border: 1px solid var(--geo); color: var(--geo); background: rgba(0,168,255,0.1); }

        @keyframes blink { 50% { opacity: 0.5; } }

        /* --- EXPLANATION TEXT --- */
        #ai-log {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0,0,0,0.3);
            border-radius: 5px;
            font-size: 0.9rem;
            line-height: 1.4;
            min-height: 60px;
            border-left: 2px solid #555;
        }

        .highlight-bio { color: var(--bio); font-weight: bold; }
        .highlight-anthro { color: var(--anthro); font-weight: bold; }
        .highlight-geo { color: var(--geo); font-weight: bold; }

        .time-display {
            font-size: 2rem;
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
            color: #fff;
        }

        button#fs-btn {
            display: block;
            margin: 30px auto 10px;
            background: transparent;
            border: 1px solid var(--bio);
            color: var(--bio);
            padding: 12px 24px;
            cursor: pointer;
            border-radius: 4px;
            font-family: 'Courier New', Courier, monospace;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 1rem;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(0, 255, 157, 0.1);
            position: relative;
            overflow: hidden;
            width: fit-content;
        }

        button#fs-btn:hover {
            background: rgba(0, 255, 157, 0.1);
            box-shadow: 0 0 25px rgba(0, 255, 157, 0.4);
            transform: translateY(-2px);
            text-shadow: 0 0 8px var(--bio);
            border-color: #fff;
        }

        button#fs-btn:active {
            transform: translateY(1px);
        }
    </style>
</head>
<body>

<div class="container">
    <div class="dashboard">
        
        <div class="card">
            <h2>Environmental Variables</h2>
            
            <div class="time-display" id="clock">06:00</div>
            <div class="control-group">
                <label><span>Time of Day</span></label>
                <input type="range" id="time-slider" min="0" max="23" value="6">
            </div>
            <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">

            <div class="control-group">
                <label><span style="color:var(--bio)">Biophony (Animals)</span> <span id="bio-val">50%</span></label>
                <input type="range" id="bio-slider" min="0" max="100" value="50">
            </div>

            <div class="control-group">
                <label><span style="color:var(--geo)">Geophony (Rain/Wind)</span> <span id="geo-val">10%</span></label>
                <input type="range" id="geo-slider" min="0" max="100" value="10">
            </div>

            <div class="control-group">
                <label><span style="color:var(--anthro)">Anthrophony (Machinery)</span> <span id="anthro-val">0%</span></label>
                <input type="range" id="anthro-slider" min="0" max="100" value="0">
            </div>

            <div id="status" class="status-box healthy">ECOSYSTEM OPTIMAL</div>
        </div>

        <div class="card">
            <h2>Live Acoustic Spectrum</h2>
            <div id="spectrogram"></div>
            <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-top:5px; color:#666;">
                <span>LOW FREQ (Bass/Motors)</span>
                <span>MID FREQ (Rain/Wind)</span>
                <span>HIGH FREQ (Birds/Insects)</span>
            </div>
            
            <div id="ai-log">
                Waiting for analysis...
            </div>
        </div>

    </div>
</div>

<button id="fs-btn">⛶ FULLSCREEN</button>

<script>
    const bioSlider = document.getElementById('bio-slider');
    const geoSlider = document.getElementById('geo-slider');
    const anthroSlider = document.getElementById('anthro-slider');
    const timeSlider = document.getElementById('time-slider');
    const clock = document.getElementById('clock');
    const spectrogram = document.getElementById('spectrogram');
    const statusBox = document.getElementById('status');
    const aiLog = document.getElementById('ai-log');
    const fsBtn = document.getElementById('fs-btn');

    // Fullscreen Toggle
    fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fsBtn.innerText = "EXIT FULLSCREEN";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fsBtn.innerText = "⛶ FULLSCREEN";
            }
        }
    });

    // Init Bars
    const barCount = 50;
    for(let i=0; i<barCount; i++){
        let d = document.createElement('div');
        d.className = 'bar';
        spectrogram.appendChild(d);
    }
    const bars = document.querySelectorAll('.bar');

    function update() {
        const bio = parseInt(bioSlider.value);
        const geo = parseInt(geoSlider.value); 
        const anthro = parseInt(anthroSlider.value); 
        const time = parseInt(timeSlider.value);

        // Update Labels
        document.getElementById('bio-val').innerText = bio + '%';
        document.getElementById('geo-val').innerText = geo + '%';
        document.getElementById('anthro-val').innerText = anthro + '%';
        clock.innerText = (time < 10 ? '0'+time : time) + ":00";

        // TIME LOGIC
        let isDay = time >= 5 && time <= 18;
        let dayActivity = isDay ? 1.0 : 0.2; 
        let nightActivity = !isDay ? 1.0 : 0.1; 
        
        // Background Color Shift
        let lightness = isDay ? 15 : 5;
        document.body.style.backgroundColor = \`hsl(230, 20%, \${lightness}%)\`;

        // LOGIC & EXPLANATION TEXT
        if (anthro > 30) {
            statusBox.className = 'status-box danger';
            statusBox.innerText = '⚠️ ILLEGAL LOGGING DETECTED';
            aiLog.innerHTML = \`<span class="highlight-anthro">CRITICAL:</span> Mechanical motor signatures detected in low frequencies. The "Anthrophony" (human noise) is masking biological signals, indicating potential illegal activity.\`;
            aiLog.style.borderColor = 'var(--anthro)';
        } else if (geo > 60) {
            statusBox.className = 'status-box masked';
            statusBox.innerText = '⛈️ SIGNAL MASKED (HEAVY RAIN)';
            aiLog.innerHTML = \`<span class="highlight-geo">NOTICE:</span> Heavy Geophony (Weather) detected. Broad-spectrum noise from rain/wind is reducing signal clarity. Data collection paused to prevent false positives.\`;
            aiLog.style.borderColor = 'var(--geo)';
        } else if (bio * dayActivity < 10 && bio * nightActivity < 10) {
            statusBox.className = 'status-box';
            statusBox.style.border = '1px solid orange';
            statusBox.style.color = 'orange';
            statusBox.innerText = '🍂 LOW BIODIVERSITY';
            aiLog.innerHTML = \`<span style="color:orange">WARNING:</span> Silent Forest. Biodiversity metrics are dropping. Acoustic niches are empty, indicating species loss or migration.\`;
            aiLog.style.borderColor = 'orange';
        } else {
            statusBox.className = 'status-box healthy';
            statusBox.innerText = '🌱 ECOSYSTEM HEALTHY';
            aiLog.innerHTML = \`<span class="highlight-bio">NORMAL:</span> Full spectral density. Acoustic niche partitioning detected. Species are successfully communicating across distinct frequency bands.\`;
            aiLog.style.borderColor = 'var(--bio)';
        }

        // RENDER BARS
        bars.forEach((bar, i) => {
            let height = 5;
            let color = '#333';

            // 1. ANTHROPHONY
            if (i < 10) {
                if(anthro > 0) {
                    height += (anthro * 0.8) + (Math.random() * 10);
                    color = 'var(--anthro)';
                }
            }

            // 2. GEOPHONY
            if (geo > 0) {
                height += (geo * 0.4) + (Math.random() * 5);
                if (height > 20 && color === '#333') color = '#2a4d69'; 
            }

            // 3. BIOPHONY
            if (i > 20) {
                if (i > 35 && isDay) {
                    let activity = bio * dayActivity;
                    if (Math.random() * 100 < activity) {
                        height += Math.random() * 60;
                        color = 'var(--bio)';
                    }
                }
                if (i > 20 && i <= 35 && !isDay) {
                    let activity = bio * nightActivity;
                    if (Math.random() * 100 < activity) {
                        height += Math.random() * 50;
                        color = '#b8ff00';
                    }
                }
            }

            bar.style.height = Math.min(height, 100) + '%';
            bar.style.backgroundColor = color;
        });
    }

    // Loop & Listeners
    setInterval(update, 100);
    bioSlider.addEventListener('input', update);
    geoSlider.addEventListener('input', update);
    anthroSlider.addEventListener('input', update);
    timeSlider.addEventListener('input', update);
    update(); 
</script>

</body>
</html>`;

const QUANTUM_DEMO = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quantum-Spectral Fusion Visualization</title>
  <style>
    body { margin: 0; overflow: hidden; background: linear-gradient(135deg, #0a0a1a, #050510); font-family: 'Segoe UI', sans-serif; }
    #container { position: fixed; width: 100%; height: 100%; top: 0; left: 0; }
    .info-panel {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(10, 10, 30, 0.8);
      padding: 15px;
      border-radius: 10px;
      color: #e0e0ff;
      border: 1px solid #00c9ff;
      z-index: 10;
      backdrop-filter: blur(5px);
    }
    .error-progress {
      margin-top: 10px;
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: #00c9ff;
      width: 63%;
      transition: width 1.5s ease;
    }
    
    button#fs-btn {
        display: block;
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        margin: 0;
        background: transparent;
        border: 1px solid #00c9ff;
        color: #00c9ff;
        padding: 12px 24px;
        cursor: pointer;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px rgba(0, 201, 255, 0.2);
        z-index: 20;
    }

    button#fs-btn:hover {
        background: rgba(0, 201, 255, 0.1);
        box-shadow: 0 0 25px rgba(0, 201, 255, 0.6);
        text-shadow: 0 0 8px #00c9ff;
        border-color: #fff;
    }
  </style>
</head>
<body>
  <div id="container"></div>
  
  <div class="info-panel">
    <h3>Quantum-Spectral Fusion Engine</h3>
    <p>Real-time scale mapping: <span id="current-scale">Quantum</span></p >
    <div class="error-progress">
      <div class="progress-bar"></div>
    </div>
    <p>63% error reduction achieved</p >
  </div>

  <button id="fs-btn">⛶ FULLSCREEN</button>

  <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js"></script>
  <script>
    // 初始化场景
    const container = document.getElementById('container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // 创建动态粒子系统
    const createParticleSystem = (scale, color, position) => {
      const particles = new THREE.BufferGeometry();
      const count = 200;
      
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      
      const colorObj = new THREE.Color(color);
      
      for (let i = 0; i < count * 3; i += 3) {
        // 随机位置偏移
        positions[i] = (Math.random() - 0.5) * 2 + position.x;
        positions[i + 1] = (Math.random() - 0.5) * 2 + position.y;
        positions[i + 2] = (Math.random() - 0.5) * 2 + position.z;
        
        // 颜色渐变
        colors[i] = colorObj.r;
        colors[i + 1] = colorObj.g;
        colors[i + 2] = colorObj.b;
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });
      
      const particleSystem = new THREE.Points(particles, material);
      particleSystem.scale.set(1.5, 1.5, 1.5);
      scene.add(particleSystem);
      
      return {
        system: particleSystem,
        update: (time) => {
          // 动态流动效果
          const offset = Math.sin(time * 0.5) * 0.5;
          particleSystem.position.x = position.x + offset;
          
          // 更新进度条
          if (scale === "Macro" && time > 10) {
            document.querySelector('.progress-bar').style.width = "63%";
          }
        }
      };
    };
    
    // 创建四个尺度粒子
    const quantum = createParticleSystem("Quantum", "#00c9ff", {x: -5, y: 0, z: 0});
    const molecular = createParticleSystem("Molecular", "#92fe9d", {x: 0, y: 0, z: 0});
    const mesoscopic = createParticleSystem("Mesoscopic", "#ff6b6b", {x: 5, y: 0, z: 0});
    const macroscopic = createParticleSystem("Macro", "#ffd166", {x: 10, y: 0, z: 0});
    
    // 添加连接线
    const createConnection = (start, end, color) => {
      const points = [];
      points.push(new THREE.Vector3(start.x, start.y, start.z));
      points.push(new THREE.Vector3(end.x, end.y, end.z));
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      return line;
    };
    
    createConnection({x:-5,y:0,z:0}, {x:0,y:0,z:0}, 0x00c9ff); // 量子→分子
    createConnection({x:0,y:0,z:0}, {x:5,y:0,z:0}, 0x92fe9d);   // 分子→介观
    createConnection({x:5,y:0,z:0}, {x:10,y:0,z:0}, 0xff6b6b);  // 介观→宏观
    
    // 添加交互控制
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Fullscreen Logic
    const fsBtn = document.getElementById('fs-btn');
    fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fsBtn.innerText = "EXIT FULLSCREEN";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fsBtn.innerText = "⛶ FULLSCREEN";
            }
        }
    });

    // 动画循环
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.01;
      
      // 更新粒子
      quantum.update(time);
      molecular.update(time);
      mesoscopic.update(time);
      macroscopic.update(time);
      
      // 更新当前尺度显示
      const scales = ["Quantum", "Molecular", "Mesoscopic", "Macro"];
      const current = Math.floor(time % scales.length);
      document.getElementById("current-scale").textContent = scales[current];
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    // 窗口调整
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
  </script>
</body>
</html>`;

export const SAMPLES: SampleDefinition[] = [
    {
        keys: ["music", "ecology"],
        disciplineName: "Soundscape Ecology",
        tagline: "The Symphony of the Biome",
        definition: "An interdisciplinary field that treats the environment as a musical composition. By recording the \"symphony\" of a landscape and separating it into component tracks (Biophony, Geophony, Anthrophony), this discipline uses signal processing and AI to convert auditory complexity into quantifiable ecological health metrics, allowing for the diagnosis of biodiversity loss through sound alone.",
        axioms: [
            "The Acoustic Niche Hypothesis: Just as instruments in an orchestra occupy different ranges to be heard, species evolve to broadcast on unique frequency bands. A healthy ecosystem utilizes the full bandwidth; a damaged one has \"silence\" in specific ranges.",
            "The Sound Triangle: All environmental audio data can be factored into three variables: Biophony (the signal/life), Geophony (the noise floor/weather), and Anthrophony (the interference/human machinery).",
            "Visualizing the Invisible: To process \"Big Sound,\" audio is converted into Spectrograms—visual heatmaps where time is the X-axis and pitch is the Y-axis. This allows for Computer Vision analysis of the ecosystem's music."
        ],
        application: "The Rainforest Connection (RFCx): A planetary \"nervous system\" using upcycled smartphones as solar-powered listening devices. These devices analyze the forest's live music 24/7. When the AI detects the specific \"dissonance\" of a chainsaw or truck engine (Anthrophony) interrupting the Biophony, it sends real-time alerts to local rangers, stopping illegal logging before the trees actually fall.",
        visualPrompt: "SAMPLE:soundscape_ecology", // Internal marker
        imageFilename: "soundscape_ecology.png",
        feasibilityScore: 85,
        feasibilityAnalysis: "The theoretical bridge is complete: nature behaves like an orchestra, and mathematical analysis of its \"music\" yields accurate biological data. The primary feasibility hurdle is hardware durability and edge-computing efficiency to filter out wind noise without discarding valuable data.",
        logicPath: ["Music", "Acoustics", "Frequency", "Spectrogram", "Bio-indices", "Ecology"],
        demoHtml: SOUNDSCAPE_DEMO
    },
    {
        keys: ["physics", "math"],
        disciplineName: "Quantum-Spectral Fusion",
        tagline: "Physical truth is scale-invariant.",
        definition: "A cross-scale computational framework that unifies quantum mechanics, molecular dynamics, mesoscopic modeling, and continuum mechanics into a single predictive pipeline. By embedding real-time data feedback and adaptive parameter optimization between scales, it enables precise mapping from atomic-level electron behavior to macroscopic material performance.",
        axioms: [
            "Physical truth is scale-invariant; accurate macroscopic prediction requires consistent information flow from the quantum foundation upward.",
            "Errors do not merely add—they compound; therefore, each scale must validate and correct the output of the previous one.",
            "The bridge between scales is not interpolation—it is mathematical transformation grounded in statistical physics, functional analysis, and optimization theory."
        ],
        application: "Polymer Failure Prediction (Aerospace), Semiconductor Thermal Design (Chip Efficiency +28%), Bio-Material Integration (Implant Stability).",
        visualPrompt: "SAMPLE:quantum_fusion",
        imageFilename: "quantum_fusion.png",
        feasibilityScore: 95,
        feasibilityAnalysis: "Approaching industrial standard. 94.7% agreement with physical measurements across polymers and semiconductors. 63.9% improvement in computational efficiency.",
        logicPath: ["Quantum", "Molecular", "Mesoscopic", "Macroscopic", "Validation"],
        demoHtml: QUANTUM_DEMO
    }
];

export const EXPLORATION_SAMPLES: ExplorationResult[] = [
    {
        rootConcept: "traditional paper making",
        fields: [
            {
                name: "Bio-Conductive Washi Interfaces",
                description: "Integration of conductive polymers (e.g., PEDOT:PSS) and silver nanowires directly into the traditional neri (mucilage) and bast fiber slurry of Japanese papermaking. Conductive elements are chemically bonded to cellulose during wet formation, creating inherently conductive, breathable, and biodegradable electronic substrates.",
                feasibilityScore: 55,
                application: "Disposable diagnostic sensors, biodegradable smart packaging, and transient environmental monitoring electronics.",
                visualPrompt: "SAMPLE:bark_paper_schematic"
            },
            {
                name: "Cellular Agriculture Scaffolding via Amate",
                description: "Adaptation of traditional bark paper techniques (e.g., Mexican Amate or Pacific Tapa cloth) to create decellulosed plant scaffolds with 78% porosity. Textured surfaces mimic extracellular matrix topography for mammalian cell attachment.",
                feasibilityScore: 47,
                application: "Low-cost scaffolds for cultured meat production and regenerative skin grafts (FDA Class II exempt pathway).",
                visualPrompt: "SAMPLE:bark_paper_schematic"
            },
            {
                name: "Stochastic Fiber Cryptography",
                description: "Leverages the chaotic 3D distribution of long fibers (e.g., Kozo or Gampi) in handmade paper to generate Physically Unclonable Functions (PUFs). UV-reactive markers (e.g., lanthanide-doped nanoparticles) are embedded during vat stage for multi-spectral authentication.",
                feasibilityScore: 76,
                application: "Quantum-resistant physical security tokens, luxury goods authentication, and cold-storage cryptographic keys.",
                visualPrompt: "SAMPLE:bark_paper_schematic"
            }
        ]
    }
];

export const findSample = (conceptA: string, conceptB: string): SampleDefinition | undefined => {
    const a = conceptA.toLowerCase().trim();
    const b = conceptB.toLowerCase().trim();

    // Helper: Check if a string contains any of the target keywords
    const contains = (input: string, targets: string[]) => targets.some(t => input.includes(t));

    // Special Logic for Physics/Math variants
    const isPhysics = (s: string) => contains(s, ["physics", "quantum", "micro physics"]);
    const isMath = (s: string) => contains(s, ["math", "advanced math"]);

    // Check specific match first
    if ((isPhysics(a) && isMath(b)) || (isPhysics(b) && isMath(a))) {
        return SAMPLES.find(s => s.keys.includes("physics") && s.keys.includes("math"));
    }

    return SAMPLES.find(s =>
        (s.keys[0] === a && s.keys[1] === b) ||
        (s.keys[0] === b && s.keys[1] === a)
    );
};

export const findSampleByTitle = (title: string): SampleDefinition | undefined => {
    return SAMPLES.find(s => s.disciplineName.toLowerCase() === title.toLowerCase());
};

export const findExplorationSample = (concept: string): ExplorationResult | undefined => {
    const c = concept.toLowerCase().trim();
    return EXPLORATION_SAMPLES.find(s => s.rootConcept.toLowerCase().trim() === c);
};
