    #version 300 es
    in vec4 vPosition;
    in vec4 vColor;
    uniform vec4 vScalar;

    out vec4 color;

    void main() {
      gl_Position = vec4(vPosition.x * vScalar.x, vPosition.y * vScalar.y, vPosition.z * vScalar.z, 1.0);
      color = vColor;
    }