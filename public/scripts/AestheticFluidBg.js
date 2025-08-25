var Color4Bg;
(function (Color4Bg) {
    class AestheticFluidBg {
        constructor(e) {
            this.config = {
                dom: "body",
                width: 0,
                height: 0,
                loop: false,
                colors: ["#6339d9", "#2349e3", "#5961e0", "#54d0dd"],
                density: .8,
                velocity: .3,
                frequency: 3,
                amplitude: 300,
                intensity: 5,
                precision: 128,
                time: 0
            };
            this.config = this.merge(this.config, e);
            if (this.config.dom) {
                this.dom = document.getElementById(this.config.dom);
            } else {
                this.dom = document.body;
            }
            if (!this.dom) {
                return;
            }
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.dom.appendChild(this.canvas);
            this.init();
        }

        merge(e, t) {
            for (let i in t) {
                if (t.hasOwnProperty(i)) {
                    e[i] = t[i];
                }
            }
            return e;
        }

        init() {
            this.w = this.config.width ? this.config.width : this.dom.offsetWidth;
            this.h = this.config.height ? this.config.height : this.dom.offsetHeight;
            this.canvas.width = this.w;
            this.canvas.height = this.h;
            this.noiseData = this.config.colors.map(() => this.createNoise());
            this.render();
        }

        createNoise() {
            const e = [];
            const t = this.config.precision;
            for (let i = 0; i <= t; i++) {
                const s = [];
                for (let n = 0; n <= t; n++) {
                    const r = Math.random();
                    s.push(r);
                }
                e.push(s);
            }
            return e;
        }

        render() {
            this.config.time += this.config.velocity / 20;
            this.draw();
            if (this.config.loop) {
                requestAnimationFrame(this.render.bind(this));
            }
        }

        draw() {
            this.ctx.clearRect(0, 0, this.w, this.h);
            this.noiseData.forEach((e, t) => {
                this.ctx.beginPath();
                this.ctx.fillStyle = this.config.colors[t];
                for (let i = 0; i <= this.config.precision; i++) {
                    const s = i / this.config.precision;
                    const n = this.w * s;
                    const r = this.calculateY(s, e);
                    this.ctx.lineTo(n, r);
                }
                this.ctx.lineTo(this.w, this.h);
                this.ctx.lineTo(0, this.h);
                this.ctx.closePath();
                this.ctx.fill();
            });
        }

        calculateY(e, t) {
            const i = this.config.frequency;
            const s = this.config.amplitude;
            const n = this.config.intensity;
            const r = this.config.time;
            const o = this.config.precision;
            let a = 0;
            let h = 0;
            let l = e * (o / n);
            let c = Math.floor(l);
            let d = l - c;
            for (let p = 0; p < n; p++) {
                if (c >= o) {
                    c %= o;
                }
                let u = (p + r) * i;
                let m = (p + r) * i + i;
                let f = this.lerp(t[p][c], t[p][c + 1], d);
                let g = this.lerp(t[p + 1][c], t[p + 1][c + 1], d);
                let _ = this.lerp(f, g, u % 1);
                a += _ * Math.pow(this.config.density, p + 1);
                h += Math.pow(this.config.density, p + 1);
            }
            return s * (a / h) + (this.h - s) / 2;
        }

        lerp(e, t, i) {
            return e * (1 - i) + t * i;
        }
    }
    Color4Bg.AestheticFluidBg = AestheticFluidBg;
})(Color4Bg || (Color4Bg = {}));