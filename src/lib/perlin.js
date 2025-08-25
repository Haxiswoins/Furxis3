
// This is a port of Ken Perlin's "Improved Noise" algorithm.
// The original Java implementation is available here:
// http://mrl.nyu.edu/~perlin/noise/
// It has been adapted for JavaScript.

/*
 * This is a clean-room implementation of the improved noise algorithm by Ken Perlin.
 * The original algorithm is described here:
 * http://mrl.nyu.edu/~perlin/paper445.pdf
 */

export const noise = new (function () {
  this.p = new Uint8Array(512);

  this.seed = function (seed) {
    if (seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
      seed |= seed << 8;
    }

    for (var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = this.p[i] ^ (seed & 255);
      } else {
        v = this.p[i] ^ ((seed >> 8) & 255);
      }
      this.p[i] = this.p[i + 256] = v;
    }
  };

  this.perlin2 = function (x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
      Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X;
    y = y - Y;
    // Wrap the integer cells at 255
    X = X & 255;
    Y = Y & 255;

    // Calculate a set of eight hashed gradient indices
    var gi = this.p[X + this.p[Y]];
    var gii00 = this.p[X + this.p[Y]];
    var gii01 = this.p[X + this.p[Y + 1]];
    var gii10 = this.p[X + 1 + this.p[Y]];
    var gii11 = this.p[X + 1 + this.p[Y + 1]];

    // Calculate noise contributions from each of the four corners
    var n00 = this.dot2(this.grad2[gii00 & 15], x, y);
    var n10 = this.dot2(this.grad2[gii10 & 15], x - 1, y);
    var n01 = this.dot2(this.grad2[gii01 & 15], x, y - 1);
    var n11 = this.dot2(this.grad2[gii11 & 15], x - 1, y - 1);

    // Compute the fade curve value for x
    var u = this.fade(x);
    // Interpolate the four results along x
    var nx0 = this.mix(n00, n10, u);
    var nx1 = this.mix(n01, n11, u);
    // Interpolate the two results along y
    var nxy = this.mix(nx0, nx1, this.fade(y));

    return nxy;
  };

  this.perlin3 = function (x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
      Y = Math.floor(y),
      Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;
    // Wrap the integer cells at 255
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate a set of eight hashed gradient indices
    var gi000 = this.p[X + this.p[Y + this.p[Z]]];
    var gi001 = this.p[X + this.p[Y + this.p[Z + 1]]];
    var gi010 = this.p[X + this.p[Y + 1 + this.p[Z]]];
    var gi011 = this.p[X + this.p[Y + 1 + this.p[Z + 1]]];
    var gi100 = this.p[X + 1 + this.p[Y + this.p[Z]]];
    var gi101 = this.p[X + 1 + this.p[Y + this.p[Z + 1]]];
    var gi110 = this.p[X + 1 + this.p[Y + 1 + this.p[Z]]];
    var gi111 = this.p[X + 1 + this.p[Y + 1 + this.p[Z + 1]]];

    // Calculate noise contributions from each of the eight corners
    var n000 = this.dot3(this.grad3[gi000 & 15], x, y, z);
    var n100 = this.dot3(this.grad3[gi100 & 15], x - 1, y, z);
    var n010 = this.dot3(this.grad3[gi010 & 15], x, y - 1, z);
    var n110 = this.dot3(this.grad3[gi110 & 15], x - 1, y - 1, z);
    var n001 = this.dot3(this.grad3[gi001 & 15], x, y, z - 1);
    var n101 = this.dot3(this.grad3[gi101 & 15], x - 1, y, z - 1);
    var n011 = this.dot3(this.grad3[gi011 & 15], x, y - 1, z - 1);
    var n111 = this.dot3(this.grad3[gi111 & 15], x - 1, y - 1, z - 1);

    // Compute the fade curve value for x, y, z
    var u = this.fade(x);
    var v = this.fade(y);
    var w = this.fade(z);
    // Interpolate
    var nx00 = this.mix(n000, n100, u);
    var nx10 = this.mix(n010, n110, u);
    var nx01 = this.mix(n001, n101, u);
    var nx11 = this.mix(n011, n111, u);
    var nxy0 = this.mix(nx00, nx10, v);
    var nxy1 = this.mix(nx01, nx11, v);
    var nxyz = this.mix(nxy0, nxy1, w);

    return nxyz;
  };

  this.fade = function (t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  this.mix = function (a, b, t) {
    return (1 - t) * a + t * b;
  };

  this.dot2 = function (g, x, y) {
    return g[0] * x + g[1] * y;
  };

  this.dot3 = function (g, x, y, z) {
    return g[0] * x + g[1] * y + g[2] * z;
  };

  this.grad2 = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  this.grad3 = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ];

  this.p = [];
  // To remove the need for index wrapping, double the permutation table length
  for (var i = 0; i < 256; i++) {
    this.p[i] = i;
  }
  // Shuffle the permutation table
  for (var i = 255; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = this.p[i];
    this.p[i] = this.p[j];
    this.p[j] = temp;
  }
  // Double the permutation table
  for (var i = 0; i < 256; i++) {
    this.p[i + 256] = this.p[i];
  }
})();
