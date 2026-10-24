const uint SHAPES[28] = uint[28](
    0x00f0u, 0x4444u, 0x0f00u, 0x2222u,
    0x0660u, 0x0660u, 0x0660u, 0x0660u,
    0x0270u, 0x0464u, 0x0e40u, 0x2620u,
    0x0360u, 0x0462u, 0x06c0u, 0x4620u,
    0x0630u, 0x0264u, 0x0c60u, 0x2640u,
    0x0710u, 0x0226u, 0x08e0u, 0x6440u,
    0x0740u, 0x0622u, 0x02e0u, 0x4460u
);
const int TYPE_I = 0, TYPE_O = 1, TYPE_T = 2, TYPE_S = 3, TYPE_Z = 4, TYPE_J = 5, TYPE_L = 6;
const int BOARD_COLS = 10, BOARD_ROWS = 20;

uint shapeMask(int type, int rotation) { return SHAPES[clamp(type, 0, 6) * 4 + (rotation & 3)]; }
bool shapeCell(uint mask, int localRow, int localCol) { return ((mask >> uint(localRow * 4 + localCol)) & 1u) != 0u; }
