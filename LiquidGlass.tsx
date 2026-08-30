// ============================================================
// LIQUID GLASS
// Premium Procedural Liquid Glass Distortion Shader for Framer
//
// Made with 💛 by Karim Saif
// ============================================================

import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

type ColorPreset = "aurora" | "ocean" | "violet" | "sunset" | "emerald" | "monochrome"

interface LiquidGlassProps {
    refraction: number
    glassDistortion: number
    lightIntensity: number
    rippleRadius: number
    cursorInfluence: number
    cursorEnabled: boolean
    blur: number
    chromaticAberration: number
    speed: number
    colorPreset: ColorPreset
}

interface ColorSet {
    a: [number, number, number]
    b: [number, number, number]
    c: [number, number, number]
    d: [number, number, number]
}

const COLOR_PRESETS: Record<ColorPreset, ColorSet> = {
    aurora: { a: [0.015, 0.008, 0.045], b: [0.09, 0.025, 0.2], c: [0.025, 0.28, 0.42], d: [0.45, 0.9, 0.82] },
    ocean: { a: [0.005, 0.015, 0.045], b: [0.008, 0.075, 0.2], c: [0.015, 0.32, 0.5], d: [0.35, 0.85, 0.95] },
    violet: { a: [0.025, 0.005, 0.07], b: [0.12, 0.015, 0.28], c: [0.4, 0.04, 0.58], d: [0.82, 0.42, 1.0] },
    sunset: { a: [0.055, 0.008, 0.012], b: [0.25, 0.025, 0.045], c: [0.68, 0.1, 0.055], d: [1.0, 0.55, 0.22] },
    emerald: { a: [0.002, 0.025, 0.02], b: [0.005, 0.13, 0.095], c: [0.01, 0.38, 0.2], d: [0.42, 0.95, 0.62] },
    monochrome: { a: [0.008, 0.008, 0.012], b: [0.055, 0.06, 0.075], c: [0.25, 0.27, 0.31], d: [0.9, 0.93, 1.0] },
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uRefraction;
uniform float uGlassDistortion;
uniform float uLightIntensity;
uniform float uRippleRadius;
uniform float uCursorInfluence;
uniform float uBlur;
uniform float uChromaticAberration;
uniform float uSpeed;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;

float hash21(vec2 p) { p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 19.19); return fract(p.x * p.y); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i), b = hash21(i + vec2(1.0,0.0)), c = hash21(i + vec2(0.0,1.0)), d = hash21(i + vec2(1.0,1.0));
    return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
float fbm(vec2 p) {
    float value = 0.0, amplitude = 0.5;
    for (int i=0;i<5;i++) { value += noise(p)*amplitude; p=p*2.02+vec2(17.13,9.37); amplitude*=0.5; }
    return value;
}
vec3 palette(float t) {
    t=clamp(t,0.0,1.0);
    float x=smoothstep(0.0,0.35,t), y=smoothstep(0.25,0.72,t), z=smoothstep(0.62,1.0,t);
    vec3 first=mix(uColorA,uColorB,x), second=mix(uColorB,uColorC,y), third=mix(uColorC,uColorD,z);
    vec3 result=mix(first,second,y); return mix(result,third,z);
}
vec3 backgroundColor(vec2 uv,float time) {
    float largeNoise=fbm(uv*1.45+vec2(time*0.025,-time*0.018));
    float mediumNoise=fbm(uv*3.8-vec2(time*0.018,time*0.012));
    float waves=sin(uv.x*5.0+sin(uv.y*3.5+time*0.18))*0.5+0.5;
    float diagonal=uv.x*0.55+uv.y*0.45;
    float value=clamp(diagonal*0.55+largeNoise*0.30+mediumNoise*0.10+waves*0.05,0.0,1.0);
    vec3 color=palette(value);
    vec2 lightA=vec2(0.25+sin(time*0.11)*0.18,0.28+cos(time*0.09)*0.16);
    vec2 lightB=vec2(0.76+cos(time*0.08)*0.14,0.68+sin(time*0.07)*0.16);
    float glowA=1.0-smoothstep(0.0,0.75,distance(uv,lightA));
    float glowB=1.0-smoothstep(0.0,0.65,distance(uv,lightB));
    color+=uColorD*glowA*0.08; color+=uColorC*glowB*0.06; return color;
}
vec2 glassDistortion(vec2 uv,float time) {
    float n1=fbm(uv*2.1+vec2(time*0.025,-time*0.017));
    float n2=fbm(uv*4.0-vec2(time*0.015,time*0.022));
    float waveX=sin(uv.y*7.0+n1*4.0+time*0.22);
    float waveY=cos(uv.x*6.0+n2*4.0-time*0.18);
    vec2 distortion=vec2(n1-0.5,n2-0.5); distortion.x+=waveX*0.07; distortion.y+=waveY*0.07; return distortion;
}
vec2 cursorDistortion(vec2 uv,float time) {
    vec2 delta=uv-uMouse; float distanceToMouse=length(delta); float radius=max(0.025,uRippleRadius);
    float influence=(1.0-smoothstep(0.0,radius,distanceToMouse))*uMouseActive;
    vec2 direction=distanceToMouse>0.0001?delta/distanceToMouse:vec2(0.0);
    vec2 tangent=vec2(-direction.y,direction.x); float normalizedDistance=distanceToMouse/radius;
    float wave=sin(normalizedDistance*18.0-time*2.2);
    float core=1.0-smoothstep(0.0,0.72,normalizedDistance);
    vec2 lens=direction*core*uRefraction*uCursorInfluence*0.085;
    lens+=direction*wave*influence*uGlassDistortion*0.025;
    lens+=tangent*wave*influence*uGlassDistortion*0.014; return lens;
}
vec3 sampleGlass(vec2 uv,vec2 distortion) {
    float pixel=1.0/max(uResolution.x,uResolution.y), blurAmount=uBlur*pixel*24.0, chroma=uChromaticAberration*0.045;
    vec2 redOffset=distortion*(1.0+chroma); redOffset.x+=blurAmount;
    vec2 greenOffset=distortion; greenOffset.y+=blurAmount*0.35;
    vec2 blueOffset=distortion*(1.0-chroma); blueOffset.x-=blurAmount;
    vec3 redSample=backgroundColor(uv+redOffset,uTime), greenSample=backgroundColor(uv+greenOffset,uTime), blueSample=backgroundColor(uv+blueOffset,uTime);
    return vec3(redSample.r,greenSample.g,blueSample.b);
}
float glassHighlight(vec2 uv,vec2 distortion,float time) {
    vec2 light=vec2(0.5+sin(time*0.13)*0.30,0.5+cos(time*0.11)*0.25);
    vec2 direction=normalize(light-uv); float surface=fbm(uv*5.0+distortion*8.0);
    float directional=sin(surface*8.0+dot(uv,direction)*5.0)*0.5+0.5;
    return smoothstep(0.68,0.96,directional);
}
void main() {
    vec2 uv=gl_FragCoord.xy/uResolution.xy;
    vec2 procedural=glassDistortion(uv,uTime)*uGlassDistortion*0.055;
    vec2 cursor=cursorDistortion(uv,uTime); vec2 distortion=procedural+cursor;
    vec3 color=sampleGlass(uv,distortion);
    float cursorDistance=distance(uv,uMouse);
    float cursorGlow=(1.0-smoothstep(0.0,max(0.025,uRippleRadius),cursorDistance))*uMouseActive;
    float distortionAmount=length(distortion);
    float fresnel=smoothstep(0.015,0.09,distortionAmount);
    color+=vec3(0.75,0.90,1.0)*fresnel*uLightIntensity*0.13;
    color+=vec3(1.0)*glassHighlight(uv,distortion,uTime)*uLightIntensity*0.10;
    color+=uColorD*cursorGlow*uLightIntensity*0.14;
    float cursorCore=(1.0-smoothstep(0.0,max(0.02,uRippleRadius*0.42),cursorDistance))*uMouseActive;
    color+=vec3(1.0)*cursorCore*uLightIntensity*0.055;
    float veil=noise(uv*12.0+distortion*8.0); color+=vec3(1.0)*veil*uGlassDistortion*0.012;
    color=color/(color+vec3(0.20)); color=pow(color,vec3(0.92));
    vec2 vignetteUV=uv-0.5; float vignette=1.0-dot(vignetteUV,vignetteUV)*0.48;
    color*=clamp(vignette,0.74,1.0); gl_FragColor=vec4(color,1.0);
}
`

function createShader(gl: WebGLRenderingContext,type:number,source:string):WebGLShader|null {
    const shader=gl.createShader(type); if(!shader)return null; gl.shaderSource(shader,source); gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.error("Liquid Glass shader compilation error:",gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null}
    return shader;
}
function createProgram(gl: WebGLRenderingContext):WebGLProgram|null {
    const vertexShader=createShader(gl,gl.VERTEX_SHADER,VERTEX_SHADER), fragmentShader=createShader(gl,gl.FRAGMENT_SHADER,FRAGMENT_SHADER);
    if(!vertexShader||!fragmentShader)return null; const program=gl.createProgram(); if(!program){gl.deleteShader(vertexShader);gl.deleteShader(fragmentShader);return null}
    gl.attachShader(program,vertexShader);gl.attachShader(program,fragmentShader);gl.linkProgram(program);gl.deleteShader(vertexShader);gl.deleteShader(fragmentShader);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){console.error("Liquid Glass program linking error:",gl.getProgramInfoLog(program));gl.deleteProgram(program);return null} return program;
}

export default function LiquidGlass(props:LiquidGlassProps){
    const {refraction,glassDistortion,lightIntensity,rippleRadius,cursorInfluence,cursorEnabled,blur,chromaticAberration,speed,colorPreset}=props;
    const isStaticRenderer=useIsStaticRenderer(); const containerRef=React.useRef<HTMLDivElement|null>(null),canvasRef=React.useRef<HTMLCanvasElement|null>(null);
    const glRef=React.useRef<WebGLRenderingContext|null>(null),programRef=React.useRef<WebGLProgram|null>(null),bufferRef=React.useRef<WebGLBuffer|null>(null);
    const uniformsRef=React.useRef<Record<string,WebGLUniformLocation|null>>({}),animationRef=React.useRef<number|null>(null),destroyedRef=React.useRef(false),visibleRef=React.useRef(true),reducedMotionRef=React.useRef(false),mouseActiveRef=React.useRef(false);
    const mouseRef=React.useRef({x:0.5,y:0.5}),targetMouseRef=React.useRef({x:0.5,y:0.5}),timeRef=React.useRef(0),lastTimeRef=React.useRef(0);

    const initializeWebGL=React.useCallback(()=>{
        const canvas=canvasRef.current;if(!canvas)return false;
        const gl=canvas.getContext("webgl",{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,powerPreference:"high-performance"});if(!gl){console.warn("Liquid Glass: WebGL is not available.");return false}
        const program=createProgram(gl);if(!program)return false;const buffer=gl.createBuffer();if(!buffer){gl.deleteProgram(program);return false}
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);gl.useProgram(program);
        const positionLocation=gl.getAttribLocation(program,"aPosition");if(positionLocation<0){gl.deleteBuffer(buffer);gl.deleteProgram(program);return false}
        gl.enableVertexAttribArray(positionLocation);gl.vertexAttribPointer(positionLocation,2,gl.FLOAT,false,0,0);
        const names=["uResolution","uTime","uMouse","uMouseActive","uRefraction","uGlassDistortion","uLightIntensity","uRippleRadius","uCursorInfluence","uBlur","uChromaticAberration","uSpeed","uColorA","uColorB","uColorC","uColorD"];
        const uniforms:Record<string,WebGLUniformLocation|null>={};for(const name of names)uniforms[name]=gl.getUniformLocation(program,name);
        gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.clearColor(0,0,0,1);glRef.current=gl;programRef.current=program;bufferRef.current=buffer;uniformsRef.current=uniforms;return true;
    },[]);

    const resize=React.useCallback(()=>{const container=containerRef.current,canvas=canvasRef.current,gl=glRef.current;if(!container||!canvas||!gl)return;const rect=container.getBoundingClientRect();const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height));const maxDPR=window.innerWidth<768?1.5:2,dpr=Math.min(window.devicePixelRatio||1,maxDPR);const pixelWidth=Math.max(1,Math.round(width*dpr)),pixelHeight=Math.max(1,Math.round(height*dpr));if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight}canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;gl.viewport(0,0,pixelWidth,pixelHeight)},[]);

    const render=React.useCallback((timestamp:number)=>{const gl=glRef.current,program=programRef.current,uniforms=uniformsRef.current;if(!gl||!program||destroyedRef.current)return;const previous=lastTimeRef.current;let delta=(timestamp-previous)/1000;if(!Number.isFinite(delta)||delta<0)delta=0;delta=Math.min(delta,0.05);lastTimeRef.current=timestamp;if(!reducedMotionRef.current&&!isStaticRenderer)timeRef.current+=delta*speed;const mouse=mouseRef.current,target=targetMouseRef.current;mouse.x+=(target.x-mouse.x)*0.12;mouse.y+=(target.y-mouse.y)*0.12;const preset=COLOR_PRESETS[colorPreset]??COLOR_PRESETS.aurora;gl.useProgram(program);
        const set1f=(name:string,value:number)=>{const location=uniforms[name];if(location)gl.uniform1f(location,value)};const set2f=(name:string,x:number,y:number)=>{const location=uniforms[name];if(location)gl.uniform2f(location,x,y)};const set3f=(name:string,value:[number,number,number])=>{const location=uniforms[name];if(location)gl.uniform3f(location,value[0],value[1],value[2])};
        set2f("uResolution",gl.drawingBufferWidth,gl.drawingBufferHeight);set1f("uTime",timeRef.current);set2f("uMouse",mouse.x,mouse.y);set1f("uMouseActive",cursorEnabled&&mouseActiveRef.current?1:0);set1f("uRefraction",refraction);set1f("uGlassDistortion",glassDistortion);set1f("uLightIntensity",lightIntensity);set1f("uRippleRadius",rippleRadius);set1f("uCursorInfluence",cursorInfluence);set1f("uBlur",blur);set1f("uChromaticAberration",chromaticAberration);set1f("uSpeed",speed);set3f("uColorA",preset.a);set3f("uColorB",preset.b);set3f("uColorC",preset.c);set3f("uColorD",preset.d);gl.drawArrays(gl.TRIANGLES,0,6);
    },[refraction,glassDistortion,lightIntensity,rippleRadius,cursorInfluence,cursorEnabled,blur,chromaticAberration,speed,colorPreset,isStaticRenderer]);

    const startAnimation=React.useCallback(()=>{if(isStaticRenderer||destroyedRef.current||animationRef.current!==null)return;lastTimeRef.current=performance.now();const frame=(timestamp:number)=>{animationRef.current=null;if(destroyedRef.current||!visibleRef.current)return;render(timestamp);animationRef.current=requestAnimationFrame(frame)};animationRef.current=requestAnimationFrame(frame)},[render,isStaticRenderer]);
    const stopAnimation=React.useCallback(()=>{if(animationRef.current!==null){cancelAnimationFrame(animationRef.current);animationRef.current=null}},[]);

    React.useEffect(()=>{const container=containerRef.current,canvas=canvasRef.current;if(!container||!canvas)return;destroyedRef.current=false;const mediaQuery=window.matchMedia("(prefers-reduced-motion: reduce)");reducedMotionRef.current=mediaQuery.matches;const handleMotionChange=()=>{reducedMotionRef.current=mediaQuery.matches};mediaQuery.addEventListener("change",handleMotionChange);if(!initializeWebGL()){mediaQuery.removeEventListener("change",handleMotionChange);return}resize();
        const resizeObserver=new ResizeObserver(()=>resize());resizeObserver.observe(container);const intersectionObserver=new IntersectionObserver(entries=>{const entry=entries[0];if(!entry)return;visibleRef.current=entry.isIntersecting;if(visibleRef.current){if(!isStaticRenderer)startAnimation();else render(performance.now())}else stopAnimation()},{threshold:0});intersectionObserver.observe(container);
        const handlePointerMove=(event:PointerEvent)=>{const rect=canvas.getBoundingClientRect();if(rect.width<=0||rect.height<=0)return;targetMouseRef.current.x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));targetMouseRef.current.y=Math.max(0,Math.min(1,1-(event.clientY-rect.top)/rect.height));mouseActiveRef.current=true};const handlePointerLeave=()=>{mouseActiveRef.current=false};canvas.addEventListener("pointermove",handlePointerMove,{passive:true});canvas.addEventListener("pointerleave",handlePointerLeave);
        const handleContextLost=(event:Event)=>{event.preventDefault();stopAnimation()};const handleContextRestored=()=>{if(destroyedRef.current)return;initializeWebGL();resize();if(isStaticRenderer)render(performance.now());else if(visibleRef.current)startAnimation()};canvas.addEventListener("webglcontextlost",handleContextLost);canvas.addEventListener("webglcontextrestored",handleContextRestored);
        if(isStaticRenderer)render(performance.now());else startAnimation();return()=>{destroyedRef.current=true;stopAnimation();resizeObserver.disconnect();intersectionObserver.disconnect();mediaQuery.removeEventListener("change",handleMotionChange);canvas.removeEventListener("pointermove",handlePointerMove);canvas.removeEventListener("pointerleave",handlePointerLeave);canvas.removeEventListener("webglcontextlost",handleContextLost);canvas.removeEventListener("webglcontextrestored",handleContextRestored);const gl=glRef.current,program=programRef.current,buffer=bufferRef.current;if(gl&&buffer)gl.deleteBuffer(buffer);if(gl&&program)gl.deleteProgram(program);glRef.current=null;programRef.current=null;bufferRef.current=null;uniformsRef.current={}},},[initializeWebGL,resize,render,startAnimation,stopAnimation,isStaticRenderer]);

    return <div ref={containerRef} style={{position:"relative",width:"100%",height:"100%",minWidth:0,minHeight:0,overflow:"hidden",background:"#08080D"}}><canvas ref={canvasRef} aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block",touchAction:"none"}} /></div>;
}

LiquidGlass.defaultProps={refraction:0.65,glassDistortion:0.55,lightIntensity:0.75,rippleRadius:0.24,cursorInfluence:0.85,cursorEnabled:true,blur:0.22,chromaticAberration:0.18,speed:0.35,colorPreset:"aurora"};

addPropertyControls(LiquidGlass,{refraction:{type:ControlType.Number,title:"Refraction",defaultValue:0.65,min:0,max:1,step:0.01,displayStepper:true,description:"Controls how strongly the glass bends the background around the cursor."},glassDistortion:{type:ControlType.Number,title:"Glass Distortion",defaultValue:0.55,min:0,max:1,step:0.01,displayStepper:true,description:"Controls the organic deformation and movement of the invisible glass surface."},lightIntensity:{type:ControlType.Number,title:"Light Intensity",defaultValue:0.75,min:0,max:2,step:0.01,displayStepper:true,description:"Controls the brightness of reflections, highlights, and optical glow."},rippleRadius:{type:ControlType.Number,title:"Ripple Radius",defaultValue:0.24,min:0.05,max:0.6,step:0.01,displayStepper:true,description:"Controls the size of the interactive ripple and lens area around the cursor."},cursorInfluence:{type:ControlType.Number,title:"Cursor Influence",defaultValue:0.85,min:0,max:1,step:0.01,displayStepper:true,description:"Controls how strongly pointer movement affects the liquid glass surface."},cursorEnabled:{type:ControlType.Boolean,title:"Cursor",defaultValue:true,description:"Enable or disable the interactive cursor lens and glass distortion."},blur:{type:ControlType.Number,title:"Blur",defaultValue:0.22,min:0,max:1,step:0.01,displayStepper:true,description:"Controls the softness and diffusion of the distorted glass effect."},chromaticAberration:{type:ControlType.Number,title:"Chromatic Aberration",defaultValue:0.18,min:0,max:1,step:0.01,displayStepper:true,description:"Controls RGB color separation around distorted areas for an optical-glass effect."},speed:{type:ControlType.Number,title:"Speed",defaultValue:0.35,min:0,max:2,step:0.01,displayStepper:true,description:"Controls the speed of the subtle animated movement inside the glass."},colorPreset:{type:ControlType.Enum,title:"Color Preset",defaultValue:"aurora",options:["aurora","ocean","violet","sunset","emerald","monochrome"],optionTitles:["Aurora","Ocean","Violet","Sunset","Emerald","Monochrome"],description:"Choose the overall color atmosphere of the liquid glass background."}});

// ============================================================
// Made with 💛 by Karim Saif
// ============================================================
