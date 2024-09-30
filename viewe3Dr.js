document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            drawPolygons3D(data.polygonsBySection.flatMap(section => section.polygons));

            window.addEventListener('resize', () => {
                drawPolygons3D(data.polygonsBySection.flatMap(section => section.polygons));
            });
        });
});

function init3DViewer() {
    const container = document.getElementById('viewer3D');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);

    camera.position.set(0, 50, 100);
    controls.update();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    return { scene, camera };
}

const { scene, camera } = init3DViewer();

function drawPolygons3D(polygons) {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    polygons.forEach(polygon => {
        const shape = new THREE.Shape();
        polygon.points2D.forEach((point, index) => {
            const [x, y] = point.vertex;
            if (index === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        });

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({ color: `#${polygon.color}`, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    });
}
