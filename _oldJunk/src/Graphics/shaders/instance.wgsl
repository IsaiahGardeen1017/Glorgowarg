struct UnfStruct {
    zoom: vec2<f32>,
    pan: vec2<f32>
};
 
@group(0) @binding(0) var<uniform> unfStruct: UnfStruct;

struct VertexInput {
    @location(0) pos: vec3<f32>,
    @location(1) color: vec4<f32>,
};

struct InstanceData {
    @location(2) instancePosition: vec2<f32>, // Position for the instance
    @location(3) instanceScale: vec2<f32>,     // Scale for the instance (added)
};
    
struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
    @location(0) color: vec4<f32>,
};

@vertex
fn vertexMain(input: VertexInput, instance: InstanceData) -> VertexOutput {
    var output: VertexOutput;
    output.pos = vec4f(
        (unfStruct.pan.x + (input.pos.x * instance.instanceScale.x) + instance.instancePosition.x ) * unfStruct.zoom.x,
        (unfStruct.pan.y + (input.pos.y * instance.instanceScale.y) + instance.instancePosition.y) * unfStruct.zoom.y,
        input.pos.z,
        1.0
    );
    output.color = input.color;
    return output;
}
      
@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    return input.color;
}