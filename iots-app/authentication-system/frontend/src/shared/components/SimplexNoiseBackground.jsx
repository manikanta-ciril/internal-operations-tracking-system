import React, { useEffect, useRef } from 'react';

/**
 * GPU-Accelerated Simplex-Noise WebGL Canvas with Palette Blending
 */
export const SimplexNoiseBackground = ({ isDarkMode }) => {
  const canvasRef = useRef(null);
  const redraw = useRef(null);
  const darkTargetRef = useRef(isDarkMode ? 1.0 : 0.0);
  const darkCurrentRef = useRef(isDarkMode ? 1.0 : 0.0);

  useEffect(() => {
    darkTargetRef.current = isDarkMode ? 1.0 : 0.0;
    redraw.current?.();
  }, [isDarkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_dark;

      vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.06;

        vec2 q = vec2(
          snoise(st * 0.85 + vec2(t * 0.35, t * 0.25)),
          snoise(st * 0.85 + vec2(-t * 0.28, t * 0.32))
        );

        vec2 r = vec2(
          snoise(st * 1.15 + q * 1.1 + vec2(t * 0.16, -t * 0.22)),
          snoise(st * 1.15 + q * 1.1 + vec2(-t * 0.24, t * 0.18))
        );

        float f = 0.5 + 0.5 * snoise(st * 1.35 + r * 1.15 + t * 0.09);
        float f2 = 0.5 + 0.5 * snoise(st * 1.95 - r * 0.95 - t * 0.13);

        vec3 darkNavy = vec3(0.125, 0.157, 0.188);
        vec3 darkCharcoal = vec3(0.133, 0.153, 0.184);
        vec3 darkSlate = vec3(0.245, 0.242, 0.230);
        vec3 goldDark = vec3(0.753, 0.596, 0.376);

        vec3 colDark = mix(darkNavy, darkCharcoal, f);
        colDark = mix(colDark, darkSlate, clamp(length(q) * 0.32, 0.0, 1.0));
        colDark = mix(colDark, goldDark, clamp(pow(f2, 3.2) * 0.30, 0.0, 1.0));

        vec3 smoke = vec3(0.865, 0.860, 0.850);
        vec3 softIvory = vec3(0.810, 0.790, 0.755);
        vec3 silver = vec3(0.710, 0.675, 0.595);
        vec3 goldLight = vec3(0.720, 0.565, 0.355);

        vec3 colLight = mix(smoke, softIvory, f);
        colLight = mix(colLight, silver, clamp(length(q) * 0.28, 0.0, 1.0));
        colLight = mix(colLight, goldLight, clamp(pow(f2, 2.5) * 0.22, 0.0, 1.0));

        vec3 finalColor = mix(colLight, colDark, u_dark);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(context, type, source) {
      const shader = context.createShader(type);
      context.shaderSource(shader, source);
      context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        console.error(context.getShaderInfoLog(shader));
        context.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const darkLoc = gl.getUniformLocation(program, 'u_dark');

    let animationFrameId;
    const startTime = performance.now();
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const render = () => {
      cancelAnimationFrame(animationFrameId);
      if (document.hidden) return;
      darkCurrentRef.current = preference.matches ? darkTargetRef.current : darkCurrentRef.current + (darkTargetRef.current - darkCurrentRef.current) * 0.08;
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, preference.matches ? 0 : (performance.now() - startTime) / 1000);
      gl.uniform1f(darkLoc, darkCurrentRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!preference.matches) animationFrameId = requestAnimationFrame(render);
    };
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      render();
    };
    const visibility = () => { cancelAnimationFrame(animationFrameId); if (!document.hidden) render(); };
    redraw.current = render;
    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', render);
      redraw.current = null;
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

export default SimplexNoiseBackground;
