import { useEffect, useRef } from 'react';

const ShaderBackground = () => {
 const canvasRef = useRef(null);

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;

 function syncSize() {
 const w = canvas.clientWidth || window.innerWidth;
 const h = canvas.clientHeight || window.innerHeight;
 if (canvas.width !== w || canvas.height !== h) {
 canvas.width = w;
 canvas.height = h;
 }
 }
 
 const resizeObserver = new ResizeObserver(syncSize);
 resizeObserver.observe(canvas);
 syncSize();

 const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
 if (!gl) return;

 const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
 v_texCoord = a_position * 0.5 + 0.5;
 gl_Position = vec4(a_position, 0.0, 1.0);
}`;
 const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
 vec2 uv = gl_FragCoord.xy / u_resolution.xy;
 float t = u_time * 0.2;
 
 vec3 color1 = vec3(0.145, 0.388, 0.922); // Royal Blue
 vec3 color2 = vec3(0.310, 0.275, 0.898); // Indigo
 vec3 color3 = vec3(0.482, 0.380, 0.922); // Purple
 
 float n = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 - t) * 0.5 + 0.5;
 float m = sin(uv.y * 4.0 - t * 0.5) * cos(uv.x * 3.0 + t * 0.8) * 0.5 + 0.5;
 
 vec3 finalColor = mix(color1, color2, n);
 finalColor = mix(finalColor, color3, m * 0.5);
 
 gl_FragColor = vec4(finalColor, 1.0);
}`;

 function cs(type, src) {
 const s = gl.createShader(type);
 gl.shaderSource(s, src);
 gl.compileShader(s);
 return s;
 }

 const prog = gl.createProgram();
 gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
 gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
 gl.linkProgram(prog);
 gl.useProgram(prog);

 const buf = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, buf);
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

 const pos = gl.getAttribLocation(prog, 'a_position');
 gl.enableVertexAttribArray(pos);
 gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

 const uTime = gl.getUniformLocation(prog, 'u_time');
 const uRes = gl.getUniformLocation(prog, 'u_resolution');

 let animationFrameId;

 function render(t) {
 if (!canvas) return;
 gl.viewport(0, 0, canvas.width, canvas.height);
 if (uTime) gl.uniform1f(uTime, t * 0.001);
 if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
 gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
 animationFrameId = requestAnimationFrame(render);
 }
 render(0);

 return () => {
 cancelAnimationFrame(animationFrameId);
 resizeObserver.disconnect();
 };
 }, []);

 return (
 <canvas 
 ref={canvasRef} 
 className="absolute inset-0 w-full h-full object-cover opacity-60" 
 style={{ display: 'block' }}
 />
 );
};

export default ShaderBackground;
