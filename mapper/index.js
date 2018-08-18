var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var controls = new THREE.OrbitControls(camera);
var gui = new dat.GUI();
gui.add(controls, 'autoRotate');

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Prepare the dome shader
var uniforms = {
	texture: {
		value: new THREE.TextureLoader().load("../spark1.png")
	}
};

var vertShader = `\
varying vec3 vColor;
void main() {
	vColor = color;
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = 0.2 * ( 300.0 / -mvPosition.z );
	gl_Position = projectionMatrix * mvPosition;
}`

var fragShader = `\
uniform sampler2D texture;
varying vec3 vColor;
void main() {
	gl_FragColor = vec4( vColor, 1.0 );
	gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
}`

var ledsmaterial = new THREE.ShaderMaterial({
	uniforms: uniforms,
	vertexShader: vertShader,
	fragmentShader: fragShader,
	blending: THREE.AdditiveBlending,
	depthTest: false,
	transparent: true,
	vertexColors: true
});

// Set up dome geometry
var dome = new Dome(2, 2.8, scene)
var pointsList = dome.verticies()
console.log(pointsList.length)

var colours = [];

for (var i = 0; i < pointsList.length; i++) {
	colours.push(1.0, 1.0, 1.0)
}

var led_particle_geo = new THREE.BufferGeometry();
led_particle_geo.addAttribute('color', new THREE.Float32BufferAttribute(colours, 3).setDynamic(true));

// Add dome points to THREE renderer
var leds_destructured = pointsList.reduce((wip, led) => wip.concat(led));
led_particle_geo.addAttribute('position', new THREE.Float32BufferAttribute(leds_destructured, 3));
var ledparticles = new THREE.Points(led_particle_geo, ledsmaterial);
ledparticles.rotation.x = -1 * Math.PI / 2;
scene.add(ledparticles);

var axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

gui.add(axesHelper, 'visible').name('Show Axes');

camera.position.x = 5;
// camera.position.y = 3;

animate();

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}
