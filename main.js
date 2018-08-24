var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var controls = new THREE.OrbitControls(camera);
var gui = new dat.GUI();
gui.add(controls, 'autoRotate');

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ledcount = 10520;

// Prepare the dome shader
var uniforms = {
	texture:   { value: new THREE.TextureLoader().load( "spark1.png" ) }
};

var colours = [];

for (var i = 0; i < ledcount; i++) {
	colours.push(1.0, 1.0, 1.0)
}

var vertShader = `\
varying vec3 vColor;
void main() {
	vColor = color;
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_PointSize = 0.05 * ( 300.0 / -mvPosition.z );
	gl_Position = projectionMatrix * mvPosition;
}`

var fragShader = `\
uniform sampler2D texture;
varying vec3 vColor;
void main() {
	gl_FragColor = vec4( vColor, 1.0 );
	gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
}`

var ledsmaterial = new THREE.ShaderMaterial( {
	uniforms:       uniforms,
	vertexShader:   vertShader,
	fragmentShader: fragShader,
	blending:       THREE.AdditiveBlending,
	depthTest:      false,
	transparent:    true,
	vertexColors:   true
});

var led_particle_geo = new THREE.BufferGeometry();
led_particle_geo.addAttribute('color', new THREE.Float32BufferAttribute(colours, 3).setDynamic(true));

// Load the LED geometry
var loader = new THREE.FileLoader();
loader.load(
	'dome.config',

	// onLoad callback
	function ( data ) {
		var leds = JSON.parse(data).led_list;
		console.log(leds)

		var leds_destructured = leds.reduce((wip, led) => wip.concat(led));

		led_particle_geo.addAttribute('position', new THREE.Float32BufferAttribute(leds_destructured, 3));

		var ledparticles = new THREE.Points(led_particle_geo, ledsmaterial);

		scene.add(ledparticles);
	},
);

var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

gui.add(axesHelper, 'visible').name('Show Axes');

camera.position.x = 5;
// camera.position.y = 3;

animate();

function animate() {
	requestAnimationFrame( animate );
                controls.update();
	render();
}

function updateColours() {
	// Construct a sort-of sinusoidal wave pattern
	var colours = led_particle_geo.attributes.color.array;

	var wave_hz = 1;
	var r_offset = 0;
	var g_offset = 2 * Math.PI / 3;
	var b_offset = 4 * Math.PI / 3;

	for ( var i = 0; i < ledcount; i++ ) {
		relativeTime = (Date.now() / 1000) * (2 * Math.PI * wave_hz) + (2 * Math.PI * i / ledcount);

		var randVal = Math.random();
		colours[3 * i] = Math.sin(relativeTime + r_offset) / 2 + 1;
		colours[3 * i + 1] = Math.sin(relativeTime + g_offset) / 2 + 1;
		colours[3 * i + 2] = Math.sin(relativeTime + b_offset) / 2 + 1;
	}
	led_particle_geo.attributes.color.needsUpdate = true;
}

function render() {
	updateColours();
	renderer.render( scene, camera );
}
