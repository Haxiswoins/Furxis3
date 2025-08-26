/**
 * @author - 維 Pop
 * @version - 1.0
 * @dependences - three.js
 * @Github - https://github.com/vito-L/AestheticFluidBg
 */
var Color4Bg;
(function (Color4Bg) {
    class AestheticFluidBg {
        constructor(option) {
            this.option = option;
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.geometry = null;
            this.material = null;
            this.points = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.windowHalfX = window.innerWidth / 2;
            this.windowHalfY = window.innerHeight / 2;
            this.init();
            this.animate();
        }
        init() {
            var _a;
            // set container
            if (this.option.dom instanceof HTMLElement) {
                this.container = this.option.dom;
            }
            else {
                this.container = document.getElementById(this.option.dom);
            }
            // set colors
            let colors = [];
            for (let i = 0; i < this.option.colors.length; i++) {
                colors.push(new THREE.Color(this.option.colors[i]));
            }
            // set camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
            this.camera.position.z = 1000;
            // set scene
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
            // set geometry
            this.geometry = new THREE.BufferGeometry();
            const vertices = [];
            const sprite = new THREE.TextureLoader().load('/spark1.png');
            for (let i = 0; i < 10000; i++) {
                const x = 2000 * Math.random() - 1000;
                const y = 2000 * Math.random() - 1000;
                const z = 2000 * Math.random() - 1000;
                vertices.push(x, y, z);
            }
            this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            // set material
            this.material = new THREE.PointsMaterial({
                size: 35,
                sizeAttenuation: true,
                map: sprite,
                alphaTest: 0.5,
                transparent: true,
            });
            this.material.color = colors[0];
            // set points
            this.points = new THREE.Points(this.geometry, this.material);
            this.scene.add(this.points);
            // set renderer
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            (_a = this.container) === null || _a === void 0 ? void 0 : _a.appendChild(this.renderer.domElement);
            // set stats
            // this.stats = new Stats();
            // this.container?.appendChild(this.stats.dom);
            // bind event
            window.addEventListener('resize', this.onWindowResize.bind(this));
            document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
            document.addEventListener('touchstart', this.onDocumentTouchStart.bind(this));
            document.addEventListener('touchmove', this.onDocumentTouchMove.bind(this));
        }
        animate() {
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            this.render();
            // this.stats?.update();
        }
        render() {
            const time = Date.now() * 0.00005;
            this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
            this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);
            if (this.option.loop) {
                const h = ((360 * (1.0 + time)) % 360) / 360;
                this.material.color.setHSL(h, 0.5, 0.5);
            }
            this.renderer.render(this.scene, this.camera);
        }
        onWindowResize() {
            this.windowHalfX = window.innerWidth / 2;
            this.windowHalfY = window.innerHeight / 2;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        onDocumentMouseMove(event) {
            this.mouseX = event.clientX - this.windowHalfX;
            this.mouseY = event.clientY - this.windowHalfY;
        }
        onDocumentTouchStart(event) {
            if (event.touches.length === 1) {
                this.mouseX = event.touches[0].pageX - this.windowHalfX;
                this.mouseY = event.touches[0].pageY - this.windowHalfY;
            }
        }
        onDocumentTouchMove(event) {
            if (event.touches.length === 1) {
                this.mouseX = event.touches[0].pageX - this.windowHalfX;
                this.mouseY = event.touches[0].pageY - this.windowHalfY;
            }
        }
        destroy() {
            var _a;
            window.removeEventListener('resize', this.onWindowResize);
            document.removeEventListener('mousemove', this.onDocumentMouseMove);
            document.removeEventListener('touchstart', this.onDocumentTouchStart);
            document.removeEventListener('touchmove', this.onDocumentTouchMove);
            cancelAnimationFrame(this.animationId);
            if (this.renderer) {
                (_a = this.renderer.domElement.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this.renderer.domElement);
            }
        }
    }
    Color4Bg.AestheticFluidBg = AestheticFluidBg;
})(Color4Bg || (Color4Bg = {}));
export const AestheticFluidBg = Color4Bg.AestheticFluidBg;
