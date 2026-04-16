// ============================================================
// ESTADO GLOBAL
// ============================================================
let scene, camera, renderer, player, playerHitbox;
let blocks = [], spikes = [], goal, backgroundObjects = [];
let keys = {};

const TILE = 1;
const MOVE_SPEED = 0.10;
const GRAVITY_FORCE = 0.12;
let gravityDir = -1;
let canFlip = false;
let currentLevel = 0;
let deathCount = 0;
let soundEnabled = true;
let audioCtx = null;
let gameRunning = false;

// ============================================================
// NIVELES
// ============================================================
const levelMeta = [
    { name: "THE DIMENSION V",   room: "SALA: COMIENZO" },
    { name: "GRAVITY GAUNTLET",  room: "SALA: EL PASILLO" },
    { name: "SPIKE MAZE",        room: "SALA: LABERINTO" },
    { name: "THE ABYSS",         room: "SALA: ABISMO" },
    { name: "FINAL ASCENT",      room: "SALA: ASCENSION" }
];

const levels = [
    // NIVEL 1
    [
        "WWWWWWWWWWWWWWWWWWWWWW",
        "W.G..................W",
        "WWWWWWWW.............W",
        "Wvvvvvvv.............W",
        "W............WWWWWW..W",
        "WWWWW................W",
        "W....................W",
        "W....WWWWWWWW........W",
        "W....................W",
        "W....................W",
        "W^^^^^^....^^^^^^^^^^W",
        "WWWWWWWW..WWWWWWWWWWWW",
        "W.....v...W....vv....W",
        "W.........W..........W",
        "W..WWWWWWWW..WWWWWW..W",
        "W..W......W..W.......W",
        "W..W..^^..W..W.......W",
        "W.....WW.....W....@..W",
        "WWWWWWWWWWWWWWWWWWWWWW"
    ],
    // NIVEL 2
    [
        "WWWWWWWWWWWWWWWWWWWWWW",
        "W................vv..W",
        "WWW.........WWWW....WW",
        "W.............W......W",
        "W.............W.WWWW.W",
        "W.............W..vv..W",
        "W.............WW....WW",
        "W^...........^W......W",
        "WW...........WWWWWWW.W",
        "WW^.........^WW......W",
        "WWW.........WWW.WWWWWW",
        "WWW^.......^WWW......W",
        "WWWW.......WWWWWWWWW.W",
        "WWWW^.....^WWWW......W",
        "WWWWW^...^WWWWW.WWWWWW",
        "WWWWWW^G^WWWWWW....@.W",
        "WWWWWWWWWWWWWWWWWWWWWW"
    ],
    // NIVEL 3
    [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "W.@.........WWWWWWWWWWWWvvvWWWvvvWWWWWWWWWWWWWWWWvvvWWWvvvWWWWWWWWWWWWWWWWvvvWWWvvvWWWWWWWWWWWWWWWWvvvWWWvvvWWWWWWWWWWWWWWWWvvvWWWvvvWWWWWWWWWWWWWWWWvvvWWWvvvWWWWWWWWWWWW",
    "W...........WWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWW",
    "W.....^.....WWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWW",
    "WWWW..W..WWWWWWWWWWWWWWW....^....WWWWWWWWWWWWWWWW....^....WWWWWWWWWWWWWWWW....^....WWWWWWWWWWWWWWWW....^....WWWWWWWWWWWWWWWW....^....WWWWWWWWWWWWWWWW....^....WWWWWWWWWWWW",
    "W.....v.....................W........................W........................W........................W........................W........................W...............W",
    "W...........................W........................W........................W........................W........................W........................W.............G.W",
    "W...........WWWWWWWWWWWW....v....WWWWWWWWWWWWWWWW....v....WWWWWWWWWWWWWWWW....v....WWWWWWWWWWWWWWWW....v....WWWWWWWWWWWWWWWW....v....WWWWWWWWWWWWWWWW....v....WWWWWWWWWWWW",
    "W...........WWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWW",
    "W.....^.....WWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWWWWWW.........WWWWWWWWWWWW",
    "WWWW..W..WWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWW",
    "W.....v.....WWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWWWWWW...WWW...WWWWWWWWWWWW",
    "W^^^^^^^^^^^WWWWWWWWWWWW^^^WWW^^^WWWWWWWWWWWWWWWW^^^WWW^^^WWWWWWWWWWWWWWWW^^^WWW^^^WWWWWWWWWWWWWWWW^^^WWW^^^WWWWWWWWWWWWWWWW^^^WWW^^^WWWWWWWWWWWWWWWW^^^WWW^^^WWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ],
    // NIVEL 4
    [
        "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
        "W...............vvvvvvvvvvvvvvvvWWWWWWWvvvvvvvvvWWWWWWWvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvWWWWWWWvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvWWWWWW",
        "W.@.............................WWWWWWW.........WWWWWWW................................WWWWWWW..................................................WWWWWWW.............WWWWWW",
        "WWWWWWW.........................WWWWWWW.........WWWWWWW.WWWW............WWWWWWWWWWWWW..WWWWWWW..............................WWWWWWWW................................WWWWWW",
        "WWWWWWW.........................................WWWWWWW................................WWWWWWW..............WWWWWWWW.....................................................W",
        "WWWWWWW....WWWWWW...............................WWWWWWW................................WWWWWWW...........................................................................W",
        "WWWWWWW.........................WWWWWWW.........WWWWWWW................................WWWWWWW.........................................................................G.W",
        "WWWWWWW.........................WWWWWWW.........WWWWWWW.....WWWWWWWWWWWW............................................WWWWWWWW........................................WWWWWW",
        "WWWWWWW.............WWWWWWWWWW..WWWWWWW.........WWWWWWW.............................................................................................................WWWWWW",
        "WWWWWWW.........................WWWWWWW...WWWW..WWWWWWW................................WWWWWWW...........................................................WWWWWWWWW..WWWWWW",
        "WWWWWWW.........................WWWWWWW................................................WWWWWWW..WWWWWWWWWWW.........................................................WWWWWW",
        "WWWWWWW.........................WWWWWWW................................................WWWWWWW........................................WWWWWWWWW.....................WWWWWW",
        "WWWWWWW^^^^^^^^^^^^^^^^^^^^^^^^^WWWWWWW^^^^^^^^^WWWWWWW^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^WWWWWWW^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^WWWWWW",
        "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ],
    // NIVEL 5
    [
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    "W...........WWWWWWWW................................WWWWWWWWvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvWWWWWWWW................................WWWWWWWWvvvvvvvvvvvvvW",
    "W...........WWWWWWWW................................WWWWWWWW................................................WWWWWWWW................................WWWWWWWW.............W",
    "W...........WWWWWWWW............^^^^^^^^............WWWWWWWW.....WWWWWWWW.........WWWWWWWW........WWWWWWWW..WWWWWWWW............^^^^^^^^............WWWWWWWW.............W",
    "W...........WWWWWWWW............WWWWWWWW............WWWWWWWW................................................WWWWWWWW............WWWWWWWW............WWWWWWWW.............W",
    "W...........WWWWWWWW............WWWWWWWW............WWWWWWWW......................................^.........WWWWWWWW............WWWWWWWW............WWWWWWWW.............W",
    "W...........WWWWWWWW............WWWWWWWW............WWWWWWWW...............................WWWWWWWW.........WWWWWWWW............WWWWWWWW............WWWWWWWW......G......W",
    "W...........WWWWWWWW............WWWWWWWW............WWWWWWWW................................................WWWWWWWW............WWWWWWWW............WWWWWWWW.............W",
    "W...........vvvvvvvv............WWWWWWWW............vvvvvvvv......................^^^^^^^^..................WWWWWWWW............WWWWWWWW............WWWWWWWW.............W",
    "W...............................WWWWWWWW..................................WWWWWWWWWWWWWWWW..................vvvvvvvv............WWWWWWWW............WWWWWWWW.............W",
    "W...............................WWWWWWWW..........................................WWWWWWWW......................................WWWWWWWW............WWWWWWWW.............W",
    "W...............................WWWWWWWW..........................................WWWWWWWW......................................WWWWWWWW............vvvvvvvv.............W",
    "W..@............................WWWWWWWW..........................................WWWWWWWW......................................WWWWWWWW.................................W",
    "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"
    ]
];

// ============================================================
// AUDIO - MUSICA CLASICA DE REDBALL (generada por tonos)
// ============================================================
function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

// ============================================================
// FONDO DECORATIVO - PARALLAX NEBULA
// ============================================================
let bgScene, bgCamera, bgRenderer;
let nebulaMeshes = [], starMeshes = [], gridMesh;

function initBackground(canvas) {
    bgScene = new THREE.Scene();
    bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    bgRenderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false });
    bgRenderer.setSize(canvas.width, canvas.height);
    bgRenderer.setPixelRatio(1);

    const bgGeo = new THREE.PlaneGeometry(2, 2);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x04060f });
    bgScene.add(new THREE.Mesh(bgGeo, bgMat));

    bgRenderer.render(bgScene, bgCamera);
}

function drawMenuBackground(canvas, time) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#04060f';
    ctx.fillRect(0, 0, W, H);

    // Nebula radial gradients
    const nebulas = [
        { x: W * 0.2, y: H * 0.3, r: 320, c1: 'rgba(255,20,60,0.10)', c2: 'transparent' },
        { x: W * 0.8, y: H * 0.6, r: 280, c1: 'rgba(0,180,255,0.09)', c2: 'transparent' },
        { x: W * 0.5, y: H * 0.5, r: 400, c1: 'rgba(60,0,120,0.10)', c2: 'transparent' },
        { x: W * 0.65, y: H * 0.2, r: 200, c1: 'rgba(255,80,0,0.07)', c2: 'transparent' }
    ];
    nebulas.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 40 * Math.sin(time * 0.4));
        g.addColorStop(0, n.c1); g.addColorStop(1, n.c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    });

    // Grid perspectiva
    ctx.strokeStyle = 'rgba(0,229,255,0.045)';
    ctx.lineWidth = 1;
    const vy = H * 0.55;
    for (let i = 0; i <= 22; i++) {
        const x = (i / 22) * W;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(W * 0.5 + (x - W * 0.5) * 0.05, vy); ctx.stroke();
    }
    for (let j = 0; j <= 14; j++) {
        const t2 = j / 14;
        const y = vy + (H - vy) * t2 * t2;
        const xl = W * 0.5 * (1 - t2 * 0.95);
        const xr = W - xl;
        ctx.beginPath(); ctx.moveTo(xl, y); ctx.lineTo(xr, y); ctx.stroke();
    }

    // Estrellas
    if (!drawMenuBackground._stars) {
        drawMenuBackground._stars = Array.from({length: 180}, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 1.6 + 0.3,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.8 + 0.2
        }));
    }
    drawMenuBackground._stars.forEach(s => {
        const alpha = 0.4 + 0.6 * Math.sin(time * s.speed + s.phase);
        ctx.fillStyle = `rgba(200,230,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    });

    // Particulas flotantes rojas
    if (!drawMenuBackground._particles) {
        drawMenuBackground._particles = Array.from({length: 28}, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vy: -(Math.random() * 0.3 + 0.1),
            r: Math.random() * 2.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.2
        }));
    }
    drawMenuBackground._particles.forEach(p => {
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        ctx.fillStyle = `rgba(255,30,60,${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ============================================================
// FONDO 3D EN JUEGO - DECORACION NEBULA + CIUDAD FONDO
// ============================================================
function buildGameBackground() {
    backgroundObjects.forEach(o => scene.remove(o));
    backgroundObjects = [];

    // Plano de fondo con gradiente / color
    const bgGeo = new THREE.PlaneGeometry(120, 80);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x04060f, depthWrite: false });
    const bgPlane = new THREE.Mesh(bgGeo, bgMat);
    bgPlane.position.set(11, -9, -8);
    bgPlane.renderOrder = -10;
    scene.add(bgPlane);
    backgroundObjects.push(bgPlane);

    // Estrellas como esferas pequeñas o puntos
    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3]     = Math.random() * 100 - 10;
        starPositions[i * 3 + 1] = Math.random() * 60 - 30;
        starPositions[i * 3 + 2] = -6 - Math.random() * 4;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xaaddff, size: 0.08, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    backgroundObjects.push(stars);

    // Nebula: esferas grandes semitransparentes al fondo
    const nebulaData = [
        { pos: [-2, -4, -5], radius: 8, color: 0x220033, opacity: 0.18 },
        { pos: [16, -12, -5], radius: 10, color: 0x001133, opacity: 0.15 },
        { pos: [6, -2, -5.5], radius: 6, color: 0x330011, opacity: 0.12 },
        { pos: [20, -4, -5], radius: 7, color: 0x002233, opacity: 0.13 }
    ];
    nebulaData.forEach(n => {
        const geo = new THREE.SphereGeometry(n.radius, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: n.opacity, depthWrite: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...n.pos);
        scene.add(mesh);
        backgroundObjects.push(mesh);
    });

    // Silueta de ciudad al fondo (cajas rectangulares oscuras)
    const buildings = [
        {x: -3, w: 1.2, h: 5}, {x: -1.2, w: 0.8, h: 8}, {x: 0.2, w: 1.5, h: 6},
        {x: 2.2, w: 0.7, h: 10}, {x: 3.3, w: 1.8, h: 7}, {x: 5.5, w: 1.0, h: 9},
        {x: 7, w: 1.4, h: 5}, {x: 8.8, w: 0.9, h: 11}, {x: 10.2, w: 1.6, h: 6},
        {x: 12.3, w: 1.1, h: 8}, {x: 14, w: 0.8, h: 12}, {x: 15.3, w: 1.5, h: 7},
        {x: 17.2, w: 1.0, h: 9}, {x: 18.7, w: 1.3, h: 5}, {x: 20.5, w: 0.9, h: 8}
    ];
    buildings.forEach(b => {
        const geo = new THREE.BoxGeometry(b.w, b.h, 0.3);
        const mat = new THREE.MeshBasicMaterial({ color: 0x080c1a });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(b.x, -18 + b.h * 0.5, -4.5);
        scene.add(mesh);
        backgroundObjects.push(mesh);

        // Ventanas: lineas brillantes
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x1133aa, transparent: true, opacity: 0.45 });
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
        mesh.add(edges);

        // Antena de luz superior
        const lightGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const lightMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff2244 : 0x00e5ff });
        const lightDot = new THREE.Mesh(lightGeo, lightMat);
        lightDot.position.set(0, b.h * 0.5 + 0.1, 0.2);
        mesh.add(lightDot);
    });

    // Grid de perspectiva al suelo (lineas)
    const gridMat = new THREE.LineBasicMaterial({ color: 0x0a2a4a, transparent: true, opacity: 0.35 });
    for (let i = -5; i <= 30; i += 2) {
        const gGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i, -20, -4), new THREE.Vector3(i, -20, 2)
        ]);
        const line = new THREE.Line(gGeo, gridMat);
        scene.add(line);
        backgroundObjects.push(line);
    }
    for (let j = -4; j <= 2; j += 1) {
        const gGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-5, -20, j), new THREE.Vector3(30, -20, j)
        ]);
        const line = new THREE.Line(gGeo, gridMat);
        scene.add(line);
        backgroundObjects.push(line);
    }
}

// ============================================================
// THREEJS - ESCENA DE JUEGO
// ============================================================
function initThree() {
    const canvas = document.getElementById('game-canvas');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060f, 0.045);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(11, -10, 18);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;

    const ambient = new THREE.AmbientLight(0x112244, 0.7);
    scene.add(ambient);

    const pointLight1 = new THREE.PointLight(0x00e5ff, 1.5, 60);
    pointLight1.position.set(10, -5, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff2244, 1.0, 40);
    pointLight2.position.set(0, -15, 8);
    scene.add(pointLight2);

    createViridian();
}

function createViridian() {
    player = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xff2244,
        emissive: 0xff2244,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.4
    });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), bodyMat);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    function makeEye(xOff) {
        const eyeGroup = new THREE.Group();
        const eyeball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), eyeMat);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), pupilMat);
        pupil.position.z = 0.07;
        eyeGroup.add(eyeball, pupil);
        eyeGroup.position.set(xOff, 0.1, 0.35);
        return eyeGroup;
    }

    player.add(body, makeEye(0.15), makeEye(-0.15));
    scene.add(player);
    playerHitbox = new THREE.Box3();
}

// ============================================================
// CARGA DE NIVEL
// ============================================================
function loadLevel(idx) {
    blocks.forEach(b => scene.remove(b));
    spikes.forEach(s => scene.remove(s));
    if (goal) scene.remove(goal);
    blocks = []; spikes = [];

    buildGameBackground();

    const map = levels[idx];
    const bGeo = new THREE.BoxGeometry(TILE, TILE, TILE);
    const sGeo = new THREE.ConeGeometry(0.38, 0.75, 4);

    const wallColors = [0x0d1f44, 0x0a1a3a, 0x071630, 0x112255, 0x0c1e48];
    const wallColor = wallColors[idx % wallColors.length];

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const char = map[y][x];
            const px = x * TILE;
            const py = -y * TILE;

            if (char === 'W' || char === 'V') {
                const mat = new THREE.MeshStandardMaterial({
                    color: char === 'W' ? wallColor : 0x220044,
                    roughness: 0.6, metalness: 0.5,
                    emissive: char === 'W' ? 0x001133 : 0x110022,
                    emissiveIntensity: 0.3
                });
                const b = new THREE.Mesh(bGeo, mat);
                b.position.set(px, py, 0);
                const edges = new THREE.LineSegments(
                    new THREE.EdgesGeometry(bGeo),
                    new THREE.LineBasicMaterial({ color: 0x0055cc, transparent: true, opacity: 0.7 })
                );
                b.add(edges);
                scene.add(b);
                b.box = new THREE.Box3().setFromObject(b);
                blocks.push(b);
            } else if (char === '^' || char === 'v') {
                const s = new THREE.Mesh(sGeo, new THREE.MeshStandardMaterial({
                    color: 0xff2244,
                    emissive: 0xaa0022,
                    emissiveIntensity: 0.5,
                    roughness: 0.4, metalness: 0.6
                }));
                s.position.set(px, py + (char === '^' ? -0.2 : 0.2), 0);
                if (char === 'v') s.rotation.z = Math.PI;
                scene.add(s);
                s.box = new THREE.Box3().setFromObject(s);
                s.box.expandByScalar(-0.25);
                spikes.push(s);
            } else if (char === '@') {
                player.position.set(px, py, 0);
                camera.position.set(px, py, 18);
            } else if (char === 'G') {
                const goalGeo = new THREE.BoxGeometry(TILE * 0.85, TILE * 0.85, TILE * 0.85);
                goal = new THREE.Mesh(goalGeo, new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    emissive: 0xffa500,
                    emissiveIntensity: 0.8,
                    roughness: 0.2, metalness: 0.8
                }));
                goal.position.set(px, py, 0);
                goal.box = new THREE.Box3().setFromObject(goal);
                scene.add(goal);
            }
        }
    }

    updateHUD();
}

// ============================================================
// LOGICA DE JUEGO
// ============================================================
let velY = 0;
let goalRotTime = 0;

function update(dt) {
    if (!gameRunning) return;

    // Movimiento horizontal
    let dx = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= MOVE_SPEED;
    if (keys['KeyD'] || keys['ArrowRight']) dx += MOVE_SPEED;

    if (dx !== 0) {
        player.position.x += dx;
        playerHitbox.setFromCenterAndSize(player.position, new THREE.Vector3(0.76, 0.76, 0.76));
        for (let b of blocks) {
            if (playerHitbox.intersectsBox(b.box)) {
                if (dx > 0) player.position.x = b.box.min.x - 0.4;
                else player.position.x = b.box.max.x + 0.4;
                break;
            }
        }
    }

    // Gravedad
    let dy = GRAVITY_FORCE * gravityDir;
    player.position.y += dy;
    playerHitbox.setFromCenterAndSize(player.position, new THREE.Vector3(0.74, 0.74, 0.74));

    canFlip = false;
    for (let b of blocks) {
        if (playerHitbox.intersectsBox(b.box)) {
            player.position.y -= dy;
            if (gravityDir < 0) player.position.y = b.box.max.y + 0.39;
            else player.position.y = b.box.min.y - 0.39;
            canFlip = true;
            break;
        }
    }

    // Animacion de la bola (squish)
    const scaleY = 1 + 0.04 * Math.sin(Date.now() * 0.006);
    player.scale.set(1, gravityDir * scaleY, 1);

    // Rotacion del goal
    goalRotTime += dt;
    if (goal) {
        goal.rotation.y = goalRotTime * 1.8;
        goal.rotation.x = goalRotTime * 0.9;
    }

    // Muerte
    spikes.forEach(s => {
        if (playerHitbox.intersectsBox(s.box)) respawn();
    });

    // Meta
    if (goal && playerHitbox.intersectsBox(goal.box)) {
  
        currentLevel++;
        if (currentLevel < levels.length) {
            gravityDir = -1;
            loadLevel(currentLevel);
        } else {
            gameRunning = false;
            showOverlay('VICTORIA', 'JUGAR DE NUEVO', () => {
                currentLevel = 0; deathCount = 0; gravityDir = -1;
                loadLevel(0); gameRunning = true;
            });
        }
    }

    // Camara smooth
    const lf = 0.09;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.position.x, lf);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, player.position.y, lf);
    camera.lookAt(player.position.x, player.position.y, 0);
}

function respawn() {
    deathCount++;
    gravityDir = -1;
    triggerDeathFlash();

    loadLevel(currentLevel);
    updateHUD();
}

function triggerDeathFlash() {
    const el = document.getElementById('death-flash');
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
}

function updateHUD() {
    document.getElementById('hud-level').textContent = 'NIVEL ' + (currentLevel + 1);
    document.getElementById('hud-room').textContent = levelMeta[currentLevel]?.room || '';
    document.getElementById('hud-deaths').textContent = 'MUERTES: ' + deathCount;
}

function showOverlay(text, actionLabel, actionFn) {
    const el = document.getElementById('overlay-msg');
    document.getElementById('overlay-text').textContent = text;
    const actionBtn = document.getElementById('btn-overlay-action');
    actionBtn.textContent = actionLabel;
    actionBtn.onclick = () => { el.style.display = 'none'; actionFn(); };
    document.getElementById('btn-overlay-menu').onclick = () => { el.style.display = 'none'; goToMenu(); };
    el.style.display = 'flex';
}

// ============================================================
// NAVEGACION ENTRE PANTALLAS
// ============================================================
function goToMenu() {
    gameRunning = false;
    document.getElementById('game-wrapper').style.display = 'none';
    document.getElementById('level-select').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

function startGame(levelIdx) {
    currentLevel = levelIdx;
    deathCount = 0;
    gravityDir = -1;

    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('level-select').style.display = 'none';
    document.getElementById('game-wrapper').style.display = 'block';
    document.getElementById('overlay-msg').style.display = 'none';

    if (!renderer) initThree();

    loadLevel(currentLevel);
    gameRunning = true;

    initAudio();

}

// ============================================================
// ANIMACION PRINCIPAL
// ============================================================
let lastTime = 0;
let menuAnimFrame;
let menuCanvas, lsCanvas;

function menuLoop(time) {
    menuAnimFrame = requestAnimationFrame(menuLoop);
    const t = time / 1000;
    if (menuCanvas && document.getElementById('main-menu').style.display !== 'none') {
        drawMenuBackground(menuCanvas, t);
    }
    if (lsCanvas && document.getElementById('level-select').style.display !== 'none') {
        drawMenuBackground(lsCanvas, t);
    }
}

function gameLoop(time) {
    requestAnimationFrame(gameLoop);
    if (!gameRunning) return;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    update(dt);
    renderer.render(scene, camera);
}

// ============================================================
// INPUTS
// ============================================================
function setupInputs() {
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && canFlip) {
            gravityDir *= -1;
            canFlip = false;

        }
        if (e.code === 'Escape' && gameRunning) {
            showOverlay('PAUSA', 'CONTINUAR', () => { gameRunning = true; });
            gameRunning = false;
        }
    });
    window.addEventListener('keyup', (e) => keys[e.code] = false);
    window.addEventListener('resize', () => {
        if (camera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ============================================================
// CONSTRUIR UI DE MENUS
// ============================================================
function buildLevelSelect() {
    const grid = document.getElementById('ls-grid');
    grid.innerHTML = '';
    levels.forEach((_, i) => {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `<span class="lc-num">${i + 1}</span><span class="lc-name">${levelMeta[i].name}</span>`;
        card.addEventListener('click', () => startGame(i));
        grid.appendChild(card);
    });
}

// ============================================================
// INICIALIZACION
// ============================================================
function init() {
    menuCanvas = document.getElementById('menu-bg');
    lsCanvas = document.getElementById('ls-bg');

    buildLevelSelect();
    setupInputs();

    // Botones del menu
    document.getElementById('btn-play').addEventListener('click', () => {
        initAudio();
        startGame(0);
    });

    document.getElementById('btn-levels').addEventListener('click', () => {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('level-select').style.display = 'flex';
    });


    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('level-select').style.display = 'none';
        document.getElementById('main-menu').style.display = 'flex';
    });

    // Animacion del fondo de menu
    requestAnimationFrame(menuLoop);
    // Loop de juego
    requestAnimationFrame(gameLoop);
}

init();
