import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';

////////////////////////////////////////////////
// Scene
////////////////////////////////////////////////

const lightHelpers = [];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, .01, 500);

////////////////////////////////////////////////
// Camera
////////////////////////////////////////////////

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(20, 15, 20);
camera.lookAt(0, 3, 0);

////////////////////////////////////////////////
// Renderer
////////////////////////////////////////////////

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

document.body.appendChild(
    renderer.domElement
);

////////////////////////////////////////////////
// Ground
////////////////////////////////////////////////

function makeTexture(draw, repeatX = 1, repeatY = 1)
{
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    draw(canvas.getContext('2d'));

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    return texture;
}

const grassTexture = makeTexture(context =>
{
    context.fillStyle = '#587b3e';
    context.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 18000; i++)
    {
        const shade = Math.random() > 0.5 ? '#75934d' : '#3e6338';
        context.fillStyle = shade;
        context.globalAlpha = Math.random() * 0.24;
        context.fillRect(Math.random() * 512, Math.random() * 512, 1, 2 + Math.random() * 3);
    }
    context.globalAlpha = 1;
}, 24, 24);

const sidingTexture = makeTexture(context =>
{
    context.fillStyle = '#c2ad83';
    context.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 64)
    {
        context.fillStyle = y % 128 === 0 ? '#cbb894' : '#bda77d';
        context.fillRect(0, y + 3, 512, 58);
        context.fillStyle = 'rgba(75, 54, 32, 0.24)';
        context.fillRect(0, y + 61, 512, 3);
        context.fillStyle = 'rgba(255, 244, 213, 0.2)';
        context.fillRect(0, y + 4, 512, 2);
    }
}, 2, 2);

const roofTexture = makeTexture(context =>
{
    context.fillStyle = '#49372f';
    context.fillRect(0, 0, 512, 512);
    for (let row = 0; row < 16; row++)
    {
        const y = row * 32;
        context.fillStyle = row % 2 ? '#554039' : '#62483f';
        context.fillRect(0, y, 512, 29);
        context.strokeStyle = 'rgba(24, 17, 15, 0.48)';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(row % 2 ? 0 : 24, y + 30);
        context.lineTo(512, y + 30);
        context.stroke();
        for (let x = row % 2 ? 0 : 24; x < 512; x += 64)
        {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x, y + 30);
            context.stroke();
        }
    }
}, 2, 2);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.MeshStandardMaterial({
        map: grassTexture,
        color: 0xc3c9a2,
        roughness: 1
    })
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

////////////////////////////////////////////////
// House and architectural details
////////////////////////////////////////////////

function addBox(width, height, depth, material, x, y, z, castShadow = true)
{
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

const sidingMaterial = new THREE.MeshStandardMaterial({
    map: sidingTexture,
    color: 0xffffff,
    roughness: 0.88
});

const house = new THREE.Mesh(
    new THREE.BoxGeometry(8, 5, 8),
    sidingMaterial
);

house.position.y = 2.5;
house.castShadow = true;
house.receiveShadow = true;

scene.add(house);

const foundationMaterial = new THREE.MeshStandardMaterial({
    color: 0x77736a,
    roughness: 0.95
});
addBox(8.5, 0.65, 8.5, foundationMaterial, 0, 0.15, 0);

const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0xe4d9bf,
    roughness: 0.72
});
const darkTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x40342e,
    roughness: 0.82
});

for (const x of [-3.9, 3.9])
{
    addBox(0.18, 5.05, 0.22, trimMaterial, x, 2.55, 4.08);
    addBox(0.18, 5.05, 0.22, trimMaterial, x, 2.55, -4.08);
    addBox(0.18, 5.05, 0.22, trimMaterial, 4.08, 2.55, x);
    addBox(0.18, 5.05, 0.22, trimMaterial, -4.08, 2.55, x);
}
addBox(8.15, 0.2, 0.22, trimMaterial, 0, 4.88, 4.08);
addBox(8.15, 0.2, 0.22, trimMaterial, 0, 4.88, -4.08);

////////////////////////////////////////////////
// Roof
////////////////////////////////////////////////

const roofMaterial = new THREE.MeshStandardMaterial({
    map: roofTexture,
    color: 0xffffff,
    roughness: 0.9
});
const roofAngle = Math.PI / 4;
for (const side of [-1, 1])
{
    const roofSlope = new THREE.Mesh(
        new THREE.BoxGeometry(5.9, 0.28, 9.2),
        roofMaterial
    );
    roofSlope.position.set(side * 2.05, 7.05, 0);
    roofSlope.rotation.z = -side * roofAngle;
    roofSlope.castShadow = true;
    roofSlope.receiveShadow = true;
    scene.add(roofSlope);

    const fascia = addBox(0.22, 0.35, 9.35, darkTrimMaterial, side * 4.12, 5.05, 0);
    fascia.rotation.z = -side * roofAngle;
}

const gableShape = new THREE.Shape();
gableShape.moveTo(-4, 0);
gableShape.lineTo(4, 0);
gableShape.lineTo(0, 4);
gableShape.closePath();
const gableGeometry = new THREE.ShapeGeometry(gableShape);
const gableMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8a47d,
    roughness: 0.9,
    side: THREE.DoubleSide
});
for (const z of [-4.015, 4.015])
{
    const gable = new THREE.Mesh(gableGeometry, gableMaterial);
    gable.position.set(0, 5, z);
    gable.castShadow = true;
    gable.receiveShadow = true;
    scene.add(gable);
}

addBox(1.1, 4.3, 1.1, new THREE.MeshStandardMaterial({
    color: 0x79594a,
    roughness: 0.95
}), -2.35, 8, -1.5);
addBox(1.35, 0.25, 1.35, darkTrimMaterial, -2.35, 10.15, -1.5);

////////////////////////////////////////////////
// Door
////////////////////////////////////////////////

const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 3, 0.2),
    new THREE.MeshStandardMaterial({
        color: 0x634331,
        roughness: 0.76
    })
);

door.position.set(0, 1.5, 4.36);

scene.add(door);
addBox(1.85, 0.18, 0.28, trimMaterial, 0, 3.08, 4.42);
addBox(0.18, 3.15, 0.28, trimMaterial, -0.84, 1.55, 4.42);
addBox(0.18, 3.15, 0.28, trimMaterial, 0.84, 1.55, 4.42);
addBox(1.18, 0.08, 0.08, darkTrimMaterial, 0, 2.32, 4.48);
addBox(1.18, 0.08, 0.08, darkTrimMaterial, 0, 0.8, 4.48);
const doorKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 12),
    new THREE.MeshStandardMaterial({ metalness: 0.8, roughness: 0.28, color: 0xb58a43 })
);
doorKnob.position.set(0.48, 1.55, 4.51);
scene.add(doorKnob);

addBox(3.4, 0.22, 2.3, roofMaterial, 0, 4.05, 5.05);
addBox(3.55, 0.18, 0.2, trimMaterial, 0, 3.9, 6.12);
for (const x of [-1.45, 1.45])
{
    addBox(0.18, 3.2, 0.18, trimMaterial, x, 2.25, 5.92);
}
addBox(3.5, 0.3, 2.1, foundationMaterial, 0, 0.22, 5.08);
for (let step = 0; step < 3; step++)
{
    addBox(2.5 - step * 0.2, 0.22, 0.45, foundationMaterial,
        0, 0.11 + step * 0.2, 6.15 + step * 0.43);
}

////////////////////////////////////////////////
// Trees
////////////////////////////////////////////////

function createTree(x, z)
{
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.38, 4.2, 10),
        new THREE.MeshStandardMaterial({
            color: 0x68452e,
            roughness: 1
        })
    );

    trunk.position.set(x, 2.1, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x416b37,
        roughness: 1
    });
    for (const [offsetX, offsetY, offsetZ, scale] of [
        [0, 4.4, 0, 1.65],
        [-1.1, 3.7, 0.25, 1.25],
        [1.05, 3.8, -0.2, 1.3],
        [-0.25, 3.6, -1.05, 1.2],
        [0.3, 3.8, 1, 1.25]
    ])
    {
        const foliage = new THREE.Mesh(
            new THREE.IcosahedronGeometry(scale, 2),
            foliageMaterial
        );
        foliage.position.set(x + offsetX, offsetY, z + offsetZ);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        scene.add(foliage);
    }
}

createTree(-12, -8);
createTree(12, -8);
createTree(10, 10);
createTree(-10, 10);

////////////////////////////////////////////////
// Light Marker
////////////////////////////////////////////////

function lightMarker(color)
{
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshBasicMaterial({
            color: color
        })
    );

    scene.add(sphere);
    lightHelpers.push(sphere);

    return sphere;
}

////////////////////////////////////////////////
// Windows
////////////////////////////////////////////////

const windows = [];

function makeWindow(x, z)
{
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffff99,
        emissiveIntensity: 0,
        roughness: 0.24,
        metalness: 0.08
    });

    const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 1.35, 0.08),
        material
    );

    const faceOffset = z > 0 ? 0.16 : -0.16;
    windowMesh.position.set(x, 3, z + faceOffset);

    scene.add(windowMesh);
    windows.push(windowMesh);

    const frameZ = z + faceOffset * 1.6;
    addBox(1.7, 0.14, 0.16, trimMaterial, x, 3.78, frameZ);
    addBox(1.7, 0.14, 0.16, trimMaterial, x, 2.22, frameZ);
    addBox(0.14, 1.7, 0.16, trimMaterial, x - 0.78, 3, frameZ);
    addBox(0.14, 1.7, 0.16, trimMaterial, x + 0.78, 3, frameZ);
    addBox(0.08, 1.3, 0.12, trimMaterial, x, 3, frameZ + faceOffset * 0.3);
    addBox(1.3, 0.08, 0.12, trimMaterial, x, 3, frameZ + faceOffset * 0.3);
    addBox(1.9, 0.12, 0.3, darkTrimMaterial, x, 2.12, frameZ);
}

makeWindow(-2.2, 4.1);
makeWindow(2.2, 4.1);
makeWindow(-2.2, -4.1);
makeWindow(2.2, -4.1);

////////////////////////////////////////////////
// Ambient Light
////////////////////////////////////////////////

const ambient = new THREE.AmbientLight(
    0xffffff,
    0.7
);

scene.add(ambient);

////////////////////////////////////////////////
// Hemisphere Light
////////////////////////////////////////////////

const hemi = new THREE.HemisphereLight(
    0x87ceeb,
    0x444444,
    0.8
);

scene.add(hemi);

////////////////////////////////////////////////
// Sun
////////////////////////////////////////////////

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.5
);

sun.position.set(10, 14, 10);
sun.castShadow = true;

scene.add(sun);

const sunMarker = lightMarker(0xffff00);

////////////////////////////////////////////////
// Moon
////////////////////////////////////////////////

const moon = new THREE.DirectionalLight(
    0x7777ff,
    0
);

moon.position.set(-20, 20, -20);

scene.add(moon);

const moonMarker = lightMarker(0x4444ff);

////////////////////////////////////////////////
// House Light
////////////////////////////////////////////////

const houseLight = new THREE.PointLight(
    0xbb99ee,
    0,
    20
);

houseLight.position.set(0, 4, 0);

scene.add(houseLight);

////////////////////////////////////////////////
// Porch Light
////////////////////////////////////////////////

const porchLight = new THREE.PointLight(
    0xffcc88,
    0,
    15
);

porchLight.position.set(0, 4, 5);

scene.add(porchLight);

const porchMarker = lightMarker(0xffaa00);

////////////////////////////////////////////////
// Flashlight
////////////////////////////////////////////////

const flashlight = new THREE.SpotLight(
    0xffffff,
    0
);

flashlight.position.set(0, 10, 0);
flashlight.angle = Math.PI / 8;

flashlight.target.position.set(
    0,
    0,
    0
);

scene.add(flashlight);
scene.add(flashlight.target);

const flashMarker = lightMarker(0xffffff);

////////////////////////////////////////////////
// TV
////////////////////////////////////////////////

const tv = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 0.2),
    new THREE.MeshStandardMaterial({
        color: 0xbb99ee,
        emissive: 0xff3020,
        emissiveIntensity: 1
    })
);

tv.position.set(4.1, 3, 0);
tv.rotation.y = Math.PI / 2;

scene.add(tv);

const tvLight = new THREE.PointLight(
    0x88aaff,
    0,
    10
);

tvLight.position.set(5.2, 3, 0);

scene.add(tvLight);
const tvMarker = lightMarker(0x00ffff);

const lightning= new THREE.PointLight(0xffffff,0,40);
lightning.position.set(-3,6,-8);
scene.add(lightning);

const fireLight = new THREE.PointLight(0xff5500,5,15);
scene.add(fireLight);
fireLight.position.set(9,1,0);
////////////////////////////////////////////////
// State
////////////////////////////////////////////////

let lightsOn = false;
let autoCycle = false;
let cycle = 0;

////////////////////////////////////////////////
// Time Functions
////////////////////////////////////////////////

function setDay()
{
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog.color.set(0x87ceeb);

    sun.intensity = 2.5;
    moon.intensity = 0;

    ambient.intensity = 0.7;

    windows.forEach(w =>
    {
        w.material.emissiveIntensity = 0;
    });

    houseLight.intensity = 0;
}

function setSunset()
{
    scene.background = new THREE.Color(0xff9966);
    scene.fog.color.set(0xff9966);

    sun.intensity = 1.2;
    moon.intensity = 0;

    sun.color.set(0xff8844);

    ambient.intensity = 0.4;
}

function setNight()
{
    scene.background = new THREE.Color(0x050520);
    scene.fog.color.set(0x050520);

    sun.intensity = 0.05;
    moon.intensity = 1.2;

    ambient.intensity = 0.15;

    if (lightsOn)
    {
        houseLight.intensity = 3;

        windows.forEach(w =>
        {
            w.material.emissiveIntensity = 2;
        });
    }
}

////////////////////////////////////////////////
// Keyboard Controls
////////////////////////////////////////////////

window.addEventListener("keydown", (e) =>
{
    switch (e.key.toLowerCase())
    {
        case "1":
            lightHelpers.forEach(helper =>
            {
                helper.visible = !helper.visible;
            });
            break;

        case "0":
        {
            const lights = [
                ambient,
                hemi,
                sun,
                moon,
                houseLight,
                porchLight,
                flashlight,
                tvLight
            ];
            const turnOn = lights.some(light => light.intensity === 0);

            autoCycle = false;
            lights.forEach(light =>
            {
                light.intensity = turnOn ? 1 : 0;
            });

            if (turnOn)
            {
                ambient.intensity = 0.7;
                hemi.intensity = 0.8;
                sun.intensity = 2.5;
                moon.intensity = 1.2;
                houseLight.intensity = 3;
                porchLight.intensity = 2;
                flashlight.intensity = 5;
                tvLight.intensity = 20;
                lightsOn = true;
                windows.forEach(w =>
                {
                    w.material.emissiveIntensity = 2;
                });
                tv.material.emissiveIntensity = 5;
            }
            else
            {
                lightsOn = false;
                windows.forEach(w =>
                {
                    w.material.emissiveIntensity = 0;
                });
                tv.material.emissiveIntensity = 0;
            }
            break;
        }
        case "d":
            setDay();
            break;

        case "s":
            setSunset();
            break;

        case "n":
            setNight();
            break;

        case "a":
            autoCycle = !autoCycle;
            break;

        case "i":
            ambient.intensity = ambient.intensity > 0 ? 0 : 0.7;
            break;

        case "u":
            autoCycle = false;
            sun.intensity = sun.intensity > 0 ? 0 : 2.5;
            break;

        case "m":
            autoCycle = false;
            moon.intensity = moon.intensity > 0 ? 0 : 1.2;
            break;

        case "l":

            lightsOn = !lightsOn;

            if (lightsOn)
            {
                houseLight.intensity = 3;

                windows.forEach(w =>
                {
                    w.material.emissiveIntensity = 2;
                });
            }
            else
            {
                houseLight.intensity = 0;

                windows.forEach(w =>
                {
                    w.material.emissiveIntensity = 0;
                });
            }
            break;

        case "p":
            porchLight.intensity =
                porchLight.intensity > 0 ? 0 : 2;
            break;

        case "f":
            flashlight.intensity =
                flashlight.intensity > 0 ? 0 : 5;
            break;

        case "h":
            hemi.intensity =
                hemi.intensity > 0 ? 0 : 0.8;
            break;

        case "t":
            if(tvLight.intensity > 0)
            {
                tvLight.intensity = 0;
                tv.material.emissiveIntensity = 0;
            }
            else
            {
                tvLight.intensity = 20; 
                tv.material.emissiveIntensity = 5;
            } 
            break;

        case "4":
            sun.color.set(0xffffff);
            break;

        case "2":
            sun.color.set(0xffaa44);
            break;

        case "3":
            sun.color.set(0xff4444);
            break;
    }

    if (e.key === "ArrowUp")
        sun.position.z -= 1;

    if (e.key === "ArrowDown")
        sun.position.z += 1;

    if (e.key === "ArrowLeft")
        sun.position.x -= 1;

    if (e.key === "ArrowRight")
        sun.position.x += 1;
});

////////////////////////////////////////////////
// Animation Loop
////////////////////////////////////////////////

function animate()
{
    requestAnimationFrame(animate);

    if (autoCycle)
    {
        cycle += 0.01;

        const t = (Math.sin(cycle) + 1) / 2;

        sun.intensity = t * 2.5;
        moon.intensity = (1 - t) * 1.2;

        scene.background =
            new THREE.Color().lerpColors(
                new THREE.Color(0x050520),
                new THREE.Color(0x87ceeb),
                t
            );
            scene.fog.color.copy(scene.background);
    }
    if(Math.random() > 0.99){
        lightning.intensity =100;
    }else{
        lightning.intensity = 0
    }
    fireLight.intensity=5+ Math.sin(Date.now(0*.02));

    sunMarker.position.copy(sun.position);
    moonMarker.position.copy(moon.position);
    flashMarker.position.copy(flashlight.position);
    porchMarker.position.copy(porchLight.position);
    tvMarker.position.copy(tvLight.position);

    renderer.render(scene, camera);
}

animate();

////////////////////////////////////////////////
// Resize
////////////////////////////////////////////////

window.addEventListener('resize', () =>
{
    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});