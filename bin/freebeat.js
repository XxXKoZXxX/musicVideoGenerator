#!/usr/bin/env node

/**
 * Freebeat CLI - Astraea Cinema & AI Music Video Studio
 * Official Command Line Interface for Freebeat AI, Special Effects, & Auth Management
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Color codes for ANSI terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

// Paths
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), '.freebeat');
const GLOBAL_CONFIG_PATH = path.join(GLOBAL_CONFIG_DIR, 'config.json');

function findProjectRoot(startDir = process.cwd()) {
  let curr = startDir;
  while (curr) {
    if (fs.existsSync(path.join(curr, 'package.json'))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const ENV_FILE_PATH = path.join(PROJECT_ROOT, '.env');

// Special Effects Presets
const SPECIAL_EFFECTS_PRESETS = [
  {
    id: 'bloom-magic',
    name: 'Bloom Magic & Golden Shimmer',
    category: 'Ethereal / Fantasy',
    description: 'Enchanting golden light rays, soft dreamy Gaussian bloom, and floating stardust particles.',
    color: '#fbbf24',
    reactive: 'Sub-Bass & Mid-Range'
  },
  {
    id: 'kissing-romance',
    name: 'Romantic Lens & Heart Flare',
    category: 'Romance / Drama',
    description: 'Soft pink anamorphic flare, gentle focal zoom pulse, floating heart bokeh, and warm sunset glow.',
    color: '#f43f5e',
    reactive: 'Kick Drum Pulse'
  },
  {
    id: 'melt-liquify',
    name: 'Psychedelic Melt & Liquify',
    category: 'Trippy / Abstract',
    description: 'Liquid displacement wave warping, iridescent color melting, and gravity-defying drip motion.',
    color: '#a855f7',
    reactive: 'Continuous Audio Waveform'
  },
  {
    id: 'electrify-lightning',
    name: 'Supercharged Cyber Lightning',
    category: 'Action / Sci-Fi',
    description: 'High-voltage electric arcs wrapping around subjects with explosive strobe transients.',
    color: '#06b6d4',
    reactive: 'High-Frequency Snare & Transient Hits'
  },
  {
    id: 'supernova-shockwave',
    name: 'Supernova Shockwave Blast',
    category: 'Cosmic / Action',
    description: 'Radial sonic boom rings, screen-shattering bass flash, and expanding stellar dust field.',
    color: '#f97316',
    reactive: 'Sub-Bass Drop & Kick Impact'
  },
  {
    id: 'matrix-glitch',
    name: 'Matrix Data Glitch & Digital Rain',
    category: 'Cyberpunk',
    description: 'Digital scanlines, RGB channel splitting, and falling green hexadecimal code streams.',
    color: '#10b981',
    reactive: 'Synthesizer & Vocal Glitch'
  },
  {
    id: 'cyber-hologram',
    name: 'Holographic Projection HUD',
    category: 'Futuristic',
    description: 'Interlaced cyan hologram scanlines, floating telemetry rings, and audio waveform data grid.',
    color: '#38bdf8',
    reactive: 'Real-Time 60 FPS Spectrum'
  }
];

// Transition Effects
const TRANSITION_EFFECTS = [
  { id: 'zoom', name: 'Hyper Zoom Pulse', description: 'Dynamic 3D forward zoom on beat drops', category: 'Camera Motion' },
  { id: 'pan', name: 'Cinematic Pan', description: 'Smooth widescreen camera glide across scene', category: 'Camera Motion' },
  { id: 'whip-pan', name: 'Whip Pan Snap', description: 'High-speed directional whip snap to next scene', category: 'Fast Action' },
  { id: 'vortex', name: 'Vortex Spiral', description: 'Rotating vortex warp transition with motion blur', category: 'Abstract Warp' },
  { id: 'glitch-cut', name: 'RGB Glitch Cut', description: 'Digital chromatic aberration glitch cut', category: 'Cyber Glitch' },
  { id: 'fade', name: 'Smooth Crossfade', description: 'Gentle dissolve between scenes synced to bar', category: 'Classic Fade' }
];

// Load global configuration
function loadGlobalConfig() {
  try {
    if (fs.existsSync(GLOBAL_CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(GLOBAL_CONFIG_PATH, 'utf8'));
    }
  } catch (_) {}
  return {};
}

// Save global configuration
function saveGlobalConfig(config) {
  try {
    if (!fs.existsSync(GLOBAL_CONFIG_DIR)) {
      fs.mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(GLOBAL_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error(`${colors.red}[Error] Failed to write global config: ${err.message}${colors.reset}`);
  }
}

// Update .env file
function updateEnvVariable(key, val) {
  let envContent = '';
  if (fs.existsSync(ENV_FILE_PATH)) {
    envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  }

  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${val}`);
  } else {
    envContent = envContent.trimEnd() + (envContent.length ? '\n' : '') + `${key}=${val}\n`;
  }

  fs.writeFileSync(ENV_FILE_PATH, envContent, 'utf8');
}

// Mask sensitive API key
function maskKey(key) {
  if (!key || key.length < 8) return '****';
  return key.slice(0, 6) + '...' + '****' + key.slice(-4);
}

// Print Banner
function printBanner() {
  console.log(`
${colors.magenta}${colors.bright}===============================================================
       FREEBEAT AI CINEMA & MUSIC VIDEO STUDIO CLI
  Seamless Neural Video Generation • AI Special Effects • Auth
===============================================================${colors.reset}
`);
}

// Print Help
function printHelp() {
  printBanner();
  console.log(`${colors.bright}USAGE:${colors.reset}`);
  console.log(`  freebeat <command> [subcommand] [options]\n`);
  console.log(`${colors.bright}COMMANDS:${colors.reset}`);
  console.log(`  ${colors.cyan}auth set-api-key [KEY]${colors.reset}       Set and store Freebeat / AI video API key`);
  console.log(`  ${colors.cyan}auth status${colors.reset}                  View active authentication & configured keys`);
  console.log(`  ${colors.cyan}effects list${colors.reset}                 List all AI Special Effects & Transitions`);
  console.log(`  ${colors.cyan}models list${colors.reset}                  List supported AI generative video models`);
  console.log(`  ${colors.cyan}status${colors.reset}                       Check status of video server & web studio`);
  console.log(`  ${colors.cyan}serve${colors.reset}                        Start local video generation backend server`);
  console.log(`  ${colors.cyan}--help, -h${colors.reset}                   Display this help message\n`);
  console.log(`${colors.bright}EXAMPLES:${colors.reset}`);
  console.log(`  freebeat auth set-api-key sk-fb-99482710492817`);
  console.log(`  freebeat effects list`);
  console.log(`  freebeat effects list --json`);
  console.log(`  freebeat models list\n`);
}

// Handler: freebeat auth
async function handleAuth(args) {
  const sub = args[0];

  if (sub === 'set-api-key') {
    let key = args[1];

    if (!key) {
      // Interactive prompt
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      key = await new Promise((resolve) => {
        rl.question(`${colors.bright}Enter your Freebeat / AI API Key: ${colors.reset}`, (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });
    }

    if (!key) {
      console.log(`${colors.red}[Error] No API key provided.${colors.reset}`);
      process.exit(1);
    }

    // Save to global config
    const globalConfig = loadGlobalConfig();
    globalConfig.apiKey = key;
    globalConfig.updatedAt = new Date().toISOString();
    saveGlobalConfig(globalConfig);

    // Save to local project .env
    try {
      updateEnvVariable('FREEBEAT_API_KEY', key);
      updateEnvVariable('FAL_KEY', key);
    } catch (_) {}

    console.log(`\n${colors.green}${colors.bright}✓ Freebeat API Key successfully configured and saved!${colors.reset}`);
    console.log(`  ${colors.bright}Key:${colors.reset}         ${colors.yellow}${maskKey(key)}${colors.reset}`);
    console.log(`  ${colors.bright}Global:${colors.reset}      ${GLOBAL_CONFIG_PATH}`);
    if (fs.existsSync(ENV_FILE_PATH)) {
      console.log(`  ${colors.bright}Project:${colors.reset}     ${ENV_FILE_PATH} (FREEBEAT_API_KEY, FAL_KEY)`);
    }
    console.log(`\n${colors.dim}You can now generate videos with AI audio reactivity enabled.${colors.reset}\n`);
    return;
  }

  if (sub === 'status' || sub === 'get-api-key' || !sub) {
    const globalConfig = loadGlobalConfig();
    let envKey = '';
    if (fs.existsSync(ENV_FILE_PATH)) {
      const content = fs.readFileSync(ENV_FILE_PATH, 'utf8');
      const match = content.match(/^(?:FREEBEAT_API_KEY|FAL_KEY)=(.*)$/m);
      if (match) envKey = match[1].trim();
    }

    const activeKey = envKey || globalConfig.apiKey || process.env.FREEBEAT_API_KEY || process.env.FAL_KEY;

    console.log(`\n${colors.bright}Freebeat Authentication Status:${colors.reset}`);
    if (activeKey) {
      console.log(`  ${colors.green}● Status:${colors.reset}    Authenticated`);
      console.log(`  ${colors.bright}Key:${colors.reset}       ${colors.yellow}${maskKey(activeKey)}${colors.reset}`);
      console.log(`  ${colors.bright}Source:${colors.reset}    ${envKey ? '.env file' : 'Global config'}`);
    } else {
      console.log(`  ${colors.yellow}○ Status:${colors.reset}    No API key set`);
      console.log(`  ${colors.dim}Run 'freebeat auth set-api-key <YOUR_KEY>' to set one.${colors.reset}`);
    }
    console.log('');
    return;
  }

  console.log(`${colors.red}Unknown auth subcommand: '${sub}'.${colors.reset} Use 'freebeat auth set-api-key <key>'.`);
}

// Handler: freebeat effects list
function handleEffects(args) {
  const isJson = args.includes('--json');

  if (isJson) {
    console.log(JSON.stringify({
      specialEffects: SPECIAL_EFFECTS_PRESETS,
      transitions: TRANSITION_EFFECTS
    }, null, 2));
    return;
  }

  printBanner();
  console.log(`${colors.bright}${colors.cyan}✨ 1. HIGH-END AI SPECIAL EFFECTS PRESETS (HOT)${colors.reset}`);
  console.log(`${colors.dim}   Real-time GLSL/Canvas visual shaders synced to song structure & frequency bands${colors.reset}\n`);

  SPECIAL_EFFECTS_PRESETS.forEach((fx, idx) => {
    console.log(`  ${colors.bright}${colors.magenta}[${idx + 1}] ${fx.name}${colors.reset}  ${colors.gray}(ID: ${colors.cyan}${fx.id}${colors.gray})${colors.reset}`);
    console.log(`      ${colors.yellow}Category:${colors.reset}    ${fx.category}`);
    console.log(`      ${colors.green}Reactive:${colors.reset}    ${fx.reactive}`);
    console.log(`      ${colors.dim}${fx.description}${colors.reset}\n`);
  });

  console.log(`${colors.bright}${colors.cyan}🎬 2. CINEMATIC SCENE TRANSITION EFFECTS${colors.reset}`);
  console.log(`${colors.dim}   Automated scene-to-scene transitions on downbeats & drops${colors.reset}\n`);

  TRANSITION_EFFECTS.forEach((tr, idx) => {
    console.log(`  ${colors.bright}${colors.green}[${idx + 1}] ${tr.name}${colors.reset}  ${colors.gray}(ID: ${colors.cyan}${tr.id}${colors.gray})${colors.reset}`);
    console.log(`      ${colors.yellow}Style:${colors.reset}       ${tr.category}`);
    console.log(`      ${colors.dim}${tr.description}${colors.reset}\n`);
  });

  console.log(`${colors.bright}USAGE IN GENERATION:${colors.reset}`);
  console.log(`  Use effect ID in studio or API payloads, e.g. ${colors.cyan}{ "specialEffect": "bloom-magic", "transition": "whip-pan" }${colors.reset}\n`);
}

// Handler: freebeat models list
function handleModels() {
  const models = [
    { id: 'kling_ai', name: 'Kling 1.5 HD Pro', provider: 'Kuaishou Kling', maxRes: '1080p / 4K', fps: 30, desc: 'Ultra-realistic human motion, precise limb dynamics and dance choreography.' },
    { id: 'luma_dream', name: 'Luma Dream Machine Ray-2', provider: 'Luma Labs', maxRes: '1080p', fps: 30, desc: 'Hyper-smooth 3D camera pan, seamless lighting physics and surreal landscapes.' },
    { id: 'runway_gen3', name: 'Runway Gen-3 Alpha', provider: 'Runway ML', maxRes: '4K Pro', fps: 60, desc: 'Hollywood cinematic quality, volumetric lighting, and precise camera controls.' },
    { id: 'minimax', name: 'MiniMax Hailuo Video-01', provider: 'MiniMax', maxRes: '1080p', fps: 25, desc: 'Expressive character facial performances, lip sync fidelity, and emotional range.' },
    { id: 'sora_ai', name: 'OpenAI Sora Turbo', provider: 'OpenAI', maxRes: '4K', fps: 60, desc: 'Massive world simulation physics, multi-character consistency, and photorealism.' }
  ];

  printBanner();
  console.log(`${colors.bright}${colors.cyan}🤖 SUPPORTED GENERATIVE AI VIDEO MODELS${colors.reset}\n`);
  models.forEach((m, idx) => {
    console.log(`  ${colors.bright}${colors.magenta}[${idx + 1}] ${m.name}${colors.reset}  ${colors.gray}(ID: ${colors.cyan}${m.id}${colors.gray})${colors.reset}`);
    console.log(`      ${colors.yellow}Provider:${colors.reset}  ${m.provider}  |  ${colors.green}Max Quality:${colors.reset} ${m.maxRes} @ ${m.fps} FPS`);
    console.log(`      ${colors.dim}${m.desc}${colors.reset}\n`);
  });
}

// Handler: freebeat status
async function handleStatus() {
  const http = require('http');
  printBanner();
  console.log(`${colors.bright}System Health & Service Connectivity:${colors.reset}\n`);

  // Check Port 4000 (Video Server)
  const checkPort = (port, path) => new Promise((resolve) => {
    const req = http.get({ host: 'localhost', port, path, timeout: 1500 }, (res) => {
      resolve({ online: true, statusCode: res.statusCode });
    });
    req.on('error', () => resolve({ online: false }));
    req.on('timeout', () => { req.destroy(); resolve({ online: false }); });
  });

  const [serverStatus, studioStatus] = await Promise.all([
    checkPort(4000, '/api/clips/samples'),
    checkPort(3220, '/')
  ]);

  console.log(`  ${serverStatus.online ? colors.green + '● ONLINE' : colors.red + '○ OFFLINE'}${colors.reset}  Video Generation Backend Server (Port 4000)`);
  console.log(`  ${studioStatus.online ? colors.green + '● ONLINE' : colors.red + '○ OFFLINE'}${colors.reset}  Astraea / Freebeat Studio Web UI (Port 3220)\n`);

  if (!serverStatus.online) {
    console.log(`  ${colors.dim}To start the backend server: run ${colors.cyan}'freebeat serve'${colors.dim} or ${colors.cyan}'npm run video-server'${colors.reset}\n`);
  }
}

// Main CLI router
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return;
  }

  switch (command.toLowerCase()) {
    case 'auth':
      await handleAuth(args.slice(1));
      break;

    case 'effects':
    case 'fx':
      handleEffects(args.slice(1));
      break;

    case 'models':
      handleModels();
      break;

    case 'status':
      await handleStatus();
      break;

    case 'serve':
      console.log(`${colors.green}[Freebeat] Launching Video Generation Server on port 4000...${colors.reset}`);
      require('child_process').spawn('node', [path.join(PROJECT_ROOT, 'server', 'index.js')], {
        stdio: 'inherit',
        shell: true
      });
      break;

    default:
      console.log(`${colors.red}Unknown command: '${command}'${colors.reset}`);
      console.log(`Run ${colors.cyan}freebeat --help${colors.reset} for available commands.`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`${colors.red}[Error] ${err.message}${colors.reset}`);
  process.exit(1);
});
