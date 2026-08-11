precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Normalize coordinates (0.0 to 1.0)
    vec2 uv = gl_FragColor.xy / u_resolution.xy;
    
    // Create multiple overlapping sine waves for a organic water feel
    float wave1 = sin(uv.x * 10.0 + u_time * 2.0) * 0.05;
    float wave2 = cos(uv.y * 8.0 + u_time * 1.5) * 0.03;
    float wave3 = sin((uv.x + uv.y) * 5.0 + u_time) * 0.02;
    
    // Combine waves to distort the vertical coordinate
    float distortion = wave1 + wave2 + wave3;
    float waterLevel = 0.5 + distortion;
    
    // Define water and sky colors
    vec3 deepWater = vec3(0.05, 0.3, 0.7);
    vec3 shallowWater = vec3(0.1, 0.6, 0.9);
    vec3 skyColor = vec3(0.95, 0.97, 1.0);
    
    // Mix the colors based on the wave threshold
    vec3 finalColor;
    if (uv.y < waterLevel) {
        // Smooth gradient inside the water
        float depth = uv.y / waterLevel;
        finalColor = mix(deepWater, shallowWater, depth);
        
        // Add a subtle white foam/highlight at the surface edge
        float edge = smoothstep(waterLevel - 0.02, waterLevel, uv.y);
        finalColor = mix(finalColor, vec3(1.0), edge * 0.4);
    } else {
        finalColor = skyColor;
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
