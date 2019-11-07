precision mediump float;
varying mediump vec3 vTextureCoord;
varying mediump vec4 vColor;
varying mediump vec4 vOverrideColor;
varying mediump vec4 vGradient;
varying mediump vec4 vSpriteDimensions;

uniform sampler2D uSampler;
uniform mediump vec2 uTextureDimensions;

float random(vec3 scale, float seed) {
  // use the fragment position for a different seed per-pixel
  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
  vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
  //vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  //vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  highp vec2 coord = vTextureCoord.xy / uTextureDimensions;
  float blur = vGradient.z;

  if ((vGradient.a >= 0.0) && (vTextureCoord.y >= vGradient.a)) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  mediump vec4 texelColor = texture2D(uSampler, coord);

  if (blur > 0.0) {
    vec4 color = vec4(0.0);
    float total = 0.0;

    // randomize the lookup values to hide the fixed number of samples
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

    for (float t = -30.0; t <= 30.0; t++) {
      float percent = (t + offset - 0.5) / 30.0;
      float weight = 1.0 - abs(percent);
      vec4 sample = texture2D(uSampler, coord + (blur * percent) / uTextureDimensions);
      // switch to pre-multiplied alpha to correctly blur transparent images
      sample.rgb *= sample.a;

      color += sample * weight;
      total += weight;
    }

    texelColor = color / total;
    texelColor.rgb /= texelColor.a + 0.00001;
  }

  mediump float yCoord = (vTextureCoord.y - vSpriteDimensions.y) / vSpriteDimensions.a;
  mediump float mixFactor = (vGradient.x * (1.0 - yCoord)) + (vGradient.y * yCoord);

  mediump float lightness = (0.2126*texelColor.r + 0.7152*texelColor.g + 0.0722*texelColor.b);
  if (vOverrideColor.a == 1.0) {
    texelColor = vec4(vOverrideColor.rgb * (lightness * 1.3), texelColor.a);
  }
  if (vOverrideColor.a == 3.0) {
    texelColor = vec4(vOverrideColor.rgb, texelColor.a);
  }
  if (vOverrideColor.a == 2.0) {
    vec3 texelHSV = rgb2hsv(texelColor.rgb);
    if ((texelHSV.x < .84) && (texelHSV.x > .82)) {
      vec3 overrideHSV = rgb2hsv(vOverrideColor.rgb);
      texelHSV.x = overrideHSV.x;
      texelHSV.y *= overrideHSV.y;
      texelHSV.z *= overrideHSV.z;
      vec3 texelRGB = hsv2rgb(texelHSV);
      texelColor = vec4(texelRGB.rgb, texelColor.a);
    }
  }

  mediump float lightnessBase = (0.2126*vColor.r + 0.7152*vColor.g + 0.0722*vColor.b);
  mediump vec4 baseColor = vec4(vColor.rgb, texelColor.a) * (1.0 + (lightness - lightnessBase));
  mediump vec4 mixColor = vec4(
    (baseColor.rgba * mixFactor) + (texelColor.rgba * (1.0 - mixFactor))
  );

  if (vColor.a > 1.0) {
    mixColor.rgb = vColor.rgb;
  }

  gl_FragColor = vec4(
    mixColor.rgb * vColor.a * texelColor.a * vTextureCoord.z,
    texelColor.a * vTextureCoord.z
  );
}

