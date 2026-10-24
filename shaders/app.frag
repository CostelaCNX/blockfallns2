#version 450
#extension GL_GOOGLE_include_directive : require
layout(location=0) out vec4 outColor;
#define STATE_ACCESS readonly
#include "abi.glsl"
#include "shapes.glsl"
#include "text.glsl"
#include "draw.glsl"

const float CELL = 36.0;
const vec2 BOARD_ORIGIN = vec2(620.0, 160.0);
const vec2 HOLD_ORIGIN = vec2(380.0, 200.0);
const vec2 NEXT_ORIGIN = vec2(1380.0, 200.0);
const float PREVIEW_BOX = 160.0;

vec3 pieceColor(int type) {
    if (type == TYPE_I) return vec3(0.10, 0.80, 0.85);
    if (type == TYPE_O) return vec3(0.95, 0.80, 0.15);
    if (type == TYPE_T) return vec3(0.65, 0.30, 0.85);
    if (type == TYPE_S) return vec3(0.30, 0.80, 0.35);
    if (type == TYPE_Z) return vec3(0.90, 0.25, 0.25);
    if (type == TYPE_J) return vec3(0.25, 0.45, 0.95);
    return vec3(0.95, 0.55, 0.15);
}

vec2 cellCenter(int col, int row) { return BOARD_ORIGIN + vec2((float(col) + 0.5) * CELL, (float(row) + 0.5) * CELL); }
float cellBox(vec2 p, vec2 center) { return box(p, center, vec2(CELL * 0.5 - 2.0), 4.0); }
float digitCoverage(vec2 p, vec2 origin, int d) { return d < 0 || d > 9 ? 0.0 : text(p, origin, DIGITS[d]); }

void drawNumber(vec2 p, vec2 origin, inout vec3 color, vec3 ink, int value) {
    int v = max(value, 0); int digits[8]; int n = 0;
    if (v == 0) { digits[0] = 0; n = 1; }
    else { while (v > 0 && n < 8) { digits[n] = v % 10; v /= 10; n++; } }
    float cov = 0.0;
    for (int i = 0; i < n; i++) cov += digitCoverage(p, origin + vec2(float(i) * DIGIT_PITCH, 0.0), digits[n - 1 - i]);
    color = mix(color, ink, clamp(cov, 0.0, 1.0));
}

float shapeCoverage(vec2 p, vec2 origin, int type, int rotation) {
    uint mask = shapeMask(type, rotation);
    float cov = 0.0;
    for (int lr = 0; lr < 4; lr++) for (int lc = 0; lc < 4; lc++)
        if (shapeCell(mask, lr, lc))
            cov = max(cov, fill(box(p, origin + vec2((float(lc) + 0.5) * 28.0, (float(lr) + 0.5) * 28.0), vec2(12.0), 3.0)));
    return cov;
}

void main() {
    vec2 p = gl_FragCoord.xy;
    vec3 color = mix(vec3(.04, .05, .09), vec3(.07, .08, .14), p.y / 1080.0);

    vec2 boardCenter = BOARD_ORIGIN + vec2(BOARD_COLS, BOARD_ROWS) * CELL * 0.5;
    color = mix(color, vec3(.03, .035, .06), fill(box(p, boardCenter, vec2(BOARD_COLS, BOARD_ROWS) * CELL * 0.5 + 10.0, 10.0)));

    for (int r = 0; r < BOARD_ROWS; r++) {
        uint row = c.rows[r];
        if (row == 0u) continue;
        for (int col = 0; col < BOARD_COLS; col++)
            if ((row & (1u << uint(col))) != 0u)
                color = mix(color, vec3(.32, .36, .44), fill(cellBox(p, cellCenter(col, r))));
    }

    if (c.flow.z > 0.0) {
        float flash = clamp(c.flow.z / 0.25, 0.0, 1.0);
        for (int r = 0; r < BOARD_ROWS; r++) {
            if ((c.events.w & (1u << uint(r))) == 0u) continue;
            float rowPanel = fill(box(p, BOARD_ORIGIN + vec2(BOARD_COLS * CELL * 0.5, (float(r) + 0.5) * CELL),
                vec2(BOARD_COLS * CELL * 0.5, CELL * 0.5 - 2.0), 4.0));
            color = mix(color, vec3(1.0), rowPanel * flash);
        }
    }

    if (c.piece.w >= 0) {
        uint mask = shapeMask(c.piece.w, c.piece.z);
        vec3 pieceInk = pieceColor(c.piece.w);
        for (int lr = 0; lr < 4; lr++) for (int lc = 0; lc < 4; lc++) {
            if (!shapeCell(mask, lr, lc)) continue;
            int col = c.piece.x + lc;
            float ghost = line(cellBox(p, cellCenter(col, int(c.stats.w) + lr)), 2.0);
            color = mix(color, pieceInk, ghost * 0.5);
            int row = c.piece.y + lr;
            if (row >= 0) color = mix(color, pieceInk, fill(cellBox(p, cellCenter(col, row))));
        }
    }

    color = mix(color, vec3(.03, .035, .06), fill(box(p, HOLD_ORIGIN + vec2(PREVIEW_BOX * 0.5), vec2(PREVIEW_BOX * 0.5), 10.0)));
    color = mix(color, vec3(.55, .62, .70), text(p, HOLD_ORIGIN + vec2(14.0, -34.0), TEXT_HOLD));
    if (c.bagMeta.y != 255u) {
        float dim = c.bagMeta.z != 0u ? 0.35 : 1.0;
        color = mix(color, pieceColor(int(c.bagMeta.y)) * dim, shapeCoverage(p, HOLD_ORIGIN + vec2(22.0, 46.0), int(c.bagMeta.y), 0));
    }

    color = mix(color, vec3(.03, .035, .06), fill(box(p, NEXT_ORIGIN + vec2(PREVIEW_BOX * 0.5), vec2(PREVIEW_BOX * 0.5), 10.0)));
    color = mix(color, vec3(.55, .62, .70), text(p, NEXT_ORIGIN + vec2(14.0, -34.0), TEXT_NEXT));
    if (c.bagMeta.x < 7u)
        color = mix(color, pieceColor(int(c.bag[c.bagMeta.x])), shapeCoverage(p, NEXT_ORIGIN + vec2(22.0, 46.0), int(c.bag[c.bagMeta.x]), 0));

    vec2 statOrigin = NEXT_ORIGIN + vec2(0.0, PREVIEW_BOX + 60.0);
    color = mix(color, vec3(.55, .62, .70), text(p, statOrigin, TEXT_SCORE));
    drawNumber(p, statOrigin + vec2(0.0, 40.0), color, vec3(.92, .95, .98), int(c.game.z));
    color = mix(color, vec3(.55, .62, .70), text(p, statOrigin + vec2(0.0, 110.0), TEXT_LINES));
    drawNumber(p, statOrigin + vec2(0.0, 150.0), color, vec3(.92, .95, .98), int(c.game.w));
    color = mix(color, vec3(.55, .62, .70), text(p, statOrigin + vec2(0.0, 220.0), TEXT_LEVEL));
    drawNumber(p, statOrigin + vec2(0.0, 260.0), color, vec3(.92, .95, .98), int(c.stats.y));

    color = mix(color, vec3(.40, .46, .54), text(p, vec2(960.0 - float(TEXT_EXIT.z) / 2.0, 1030.0), TEXT_EXIT));

    if ((c.game.y & 2u) != 0u) {
        color = mix(color, vec3(.02, .02, .04), fill(box(p, vec2(960, 540), vec2(620, 260), 20.0)) * 0.92);
        color = mix(color, vec3(.95, .35, .35), text(p, vec2(960.0 - float(TEXT_GAMEOVER.z) / 2.0, 440.0), TEXT_GAMEOVER));
        color = mix(color, vec3(.85, .90, .95), text(p, vec2(960.0 - float(TEXT_RESTART.z) / 2.0, 560.0), TEXT_RESTART));
    }

    outColor = vec4(color * (1.0 - c.transition.x), 1);
}
