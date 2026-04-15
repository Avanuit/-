let scene, camera, renderer, player, playerHitbox;
let blocks = [], spikes = [], goal;
let keys = {};

const TILE = 1;
const MOVE_SPEED = 0.10;
const GRAVITY_FORCE = 0.12;
let gravityDir = -1; 
let canFlip = false;
let currentLevel = 0;

// Mantenemos tus niveles exactamente como los diseñaste
const levels = [
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
    [
        "WWWWWWWWWWWWWWWWWWWWWW",
        "W...............vvv..W",
        "W.............W......W",
        "W.............WWWWWW.W",
        "W.............W......W",
        "W^...........^W.WWWWWW",
        "WW^.........^WW......W",
        "WWW^.......^WWWWWWWW.W",
        "WWWW^.....^WWWW......W",
        "WWWWW^...^WWWWW..WWWWW",
        "WWWWWW^G^WWWWWW....@.W",
        "WWWWWWWWWWWWWWWWWWWWWW"
    ]
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050515);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Posición inicial
    camera.position.set(11, -10, 18); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(10, -10, 10);
    scene.add(pointLight);

    createViridian();
    loadLevel(0);

    window.onkeydown = (e) => {
        keys[e.code] = true;
        if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && canFlip) {
            gravityDir *= -1;
            canFlip = false;
            player.scale.y = gravityDir;
        }
    };
    window.onkeyup = (e) => keys[e.code] = false;
    animate();
}

function createViridian() {
    player = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), mat);
    const eyeMat = new THREE.MeshBasicMaterial({color: 0x000000});
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), eyeMat);
    eye.position.set(0.2, 0.2, 0.3);
    const eye2 = eye.clone(); eye2.position.x = -0.2;
    
    player.add(body, eye, eye2);
    scene.add(player);
    playerHitbox = new THREE.Box3();
}

function loadLevel(idx) {
    blocks.forEach(b => scene.remove(b));
    spikes.forEach(s => scene.remove(s));
    if(goal) scene.remove(goal);
    blocks = []; spikes = [];

    const map = levels[idx];
    const bGeo = new THREE.BoxGeometry(TILE, TILE, TILE);
    const sGeo = new THREE.ConeGeometry(0.4, 0.8, 4);

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const char = map[y][x];
            const px = x * TILE;
            const py = -y * TILE;

            // Tratamos 'W' y 'V' como bloques sólidos
            if (char === 'W' || char === 'V') {
                const mat = new THREE.MeshStandardMaterial({ color: char === 'W' ? 0x223366 : 0x332266 });
                const b = new THREE.Mesh(bGeo, mat);
                b.position.set(px, py, 0);
                const edges = new THREE.LineSegments(
                    new THREE.EdgesGeometry(bGeo),
                    new THREE.LineBasicMaterial({ color: 0x44aaff })
                );
                b.add(edges);
                scene.add(b);
                b.box = new THREE.Box3().setFromObject(b);
                blocks.push(b);
            } else if (char === '^' || char === 'v') {
                const s = new THREE.Mesh(sGeo, new THREE.MeshStandardMaterial({color: 0xff0044}));
                s.position.set(px, py + (char === '^' ? -0.2 : 0.2), 0);
                if(char === 'v') s.rotation.z = Math.PI;
                scene.add(s);
                s.box = new THREE.Box3().setFromObject(s);
                s.box.expandByScalar(-0.25);
                spikes.push(s);
            } else if (char === '@') {
                player.position.set(px, py, 0);
                // Centrar cámara instantáneamente al cargar nivel
                camera.position.x = px;
                camera.position.y = py;
            } else if (char === 'G') {
                goal = new THREE.Mesh(bGeo, new THREE.MeshStandardMaterial({color: 0xffff00, emissive: 0x999900}));
                goal.position.set(px, py, 0);
                goal.box = new THREE.Box3().setFromObject(goal);
                scene.add(goal);
            }
        }
    }
}

function update() {
    // 1. MOVIMIENTO HORIZONTAL
    let dx = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= MOVE_SPEED;
    if (keys['KeyD'] || keys['ArrowRight']) dx += MOVE_SPEED;

    if (dx !== 0) {
        player.position.x += dx;
        playerHitbox.setFromCenterAndSize(player.position, new THREE.Vector3(0.55, 0.75, 0.55));
        for (let b of blocks) {
            if (playerHitbox.intersectsBox(b.box)) {
                if (dx > 0) player.position.x = b.box.min.x - 0.31;
                else player.position.x = b.box.max.x + 0.31;
                break;
            }
        }
    }

    // 2. MOVIMIENTO VERTICAL
    let dy = GRAVITY_FORCE * gravityDir;
    player.position.y += dy;
    playerHitbox.setFromCenterAndSize(player.position, new THREE.Vector3(0.5, 0.8, 0.5));
    
    canFlip = false;
    for (let b of blocks) {
        if (playerHitbox.intersectsBox(b.box)) {
            player.position.y -= dy;
            if (gravityDir < 0) player.position.y = b.box.max.y + 0.4;
            else player.position.y = b.box.min.y - 0.4;
            canFlip = true;
            break;
        }
    }

    // 3. MUERTE Y META
    spikes.forEach(s => { if (playerHitbox.intersectsBox(s.box)) respawn(); });
    if (goal && playerHitbox.intersectsBox(goal.box)) {
        currentLevel++;
        if (currentLevel < levels.length) loadLevel(currentLevel);
        else document.getElementById('msg').style.display = 'block';
    }

    // --- SEGUIMIENTO DE CÁMARA MEJORADO ---
    // Suavizado en X y Y para que no se pierda en niveles altos
    const lerpFactor = 0.08;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.position.x, lerpFactor);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, player.position.y, lerpFactor);
    
    // Mantener el ángulo 2.5D: la cámara mira siempre un poco por debajo del jugador
    camera.lookAt(player.position.x, player.position.y, 0);
}

function respawn() {
    gravityDir = -1;
    player.scale.y = 1;
    loadLevel(currentLevel);
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

init();