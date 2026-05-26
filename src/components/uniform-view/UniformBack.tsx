"use client";

import { TEAM } from "@/config/team";

type UniformBackProps = {
  uniformName: string;
  numberDisp: string;
  clipPathId?: string;
};

const PRIMARY = TEAM.uniform.svg.primaryColor;
const ACCENT = TEAM.uniform.svg.accentColor;
const NUMBER_FONT = TEAM.uniform.svg.numberFontFamily;
const SHOW_STRIPES = TEAM.uniform.svg.stripeStyle !== "none";

/*
 * viewBox 480x340
 * 袖を大きく確保し、実物のTシャツに近いシルエット
 * 袖:身頃:袖 ≈ 20%:60%:20%
 */
const UNIFORM_PATH =
  "M 140,0 L 0,40 L 40,128 L 90,120 Q 92,150 95,175 L 95,348 Q 95,363 115,363 L 365,363 Q 385,363 385,348 L 385,175 Q 388,150 390,120 L 440,128 L 480,40 L 340,0 Z";

const CENTER_X = 240;

/* ストライプ水平位置（中央を基準に対称配置） */
const STRIPE_W = 22; /* 金2(外側のみ) + 青20 */
const STRIPE_GAP = 10;
const LEFT_X = CENTER_X - STRIPE_GAP / 2 - STRIPE_W; /* 217 */
const RIGHT_X = CENTER_X + STRIPE_GAP / 2; /* 249 */

/* ストライプ垂直位置（名前・背番号を避けて上下に分断） */
const STRIPE_UPPER_Y = 10;
const STRIPE_UPPER_H = 48; /* y=10〜58 */
const STRIPE_LOWER_Y = 233;
const STRIPE_LOWER_H = 130; /* y=233〜363, 1.2倍 */

function getNameFontSize(name: string): number {
  if (name.length > 10) return 24;
  if (name.length > 8) return 30;
  if (name.length > 6) return 36;
  return 44;
}

function getNumberFontSize(numberDisp: string): number {
  if (numberDisp.length > 2) return 90;
  return 130;
}

function Stripe({
  x,
  y,
  h,
  goldSide,
}: {
  x: number;
  y: number;
  h: number;
  goldSide: "left" | "right";
}) {
  if (goldSide === "left") {
    return (
      <>
        <rect x={x} y={y} width="2" height={h} fill={ACCENT} />
        <rect x={x + 2} y={y} width="20" height={h} fill={PRIMARY} />
      </>
    );
  }
  return (
    <>
      <rect x={x} y={y} width="20" height={h} fill={PRIMARY} />
      <rect x={x + 20} y={y} width="2" height={h} fill={ACCENT} />
    </>
  );
}

export default function UniformBack({
  uniformName,
  numberDisp,
  clipPathId = "uniformClip",
}: UniformBackProps) {
  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      <svg
        viewBox="0 0 480 370"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label={`${uniformName} ${numberDisp}番のユニフォーム背面`}
      >
        {SHOW_STRIPES && (
          <defs>
            <clipPath id={clipPathId}>
              <path d={UNIFORM_PATH} />
            </clipPath>
          </defs>
        )}

        {/* ユニフォーム外形 */}
        <path
          d={UNIFORM_PATH}
          fill="#FFFFFF"
          stroke="#DDDDDD"
          strokeWidth="1.2"
        />

        {/* 首元のカーブ（襟トリム） */}
        <path
          d="M 190,0 Q 240,20 290,0"
          fill="#FFFFFF"
          stroke={PRIMARY}
          strokeWidth="2.5"
        />

        {/* クリッピングされたストライプ群 */}
        {SHOW_STRIPES && (
          <g clipPath={`url(#${clipPathId})`}>
            {/* 上部ストライプ（襟下〜名前の手前） */}
            <Stripe
              x={LEFT_X}
              y={STRIPE_UPPER_Y}
              h={STRIPE_UPPER_H}
              goldSide="left"
            />
            <Stripe
              x={RIGHT_X}
              y={STRIPE_UPPER_Y}
              h={STRIPE_UPPER_H}
              goldSide="right"
            />

            {/* 下部ストライプ（背番号の下〜裾） */}
            <Stripe
              x={LEFT_X}
              y={STRIPE_LOWER_Y}
              h={STRIPE_LOWER_H}
              goldSide="left"
            />
            <Stripe
              x={RIGHT_X}
              y={STRIPE_LOWER_Y}
              h={STRIPE_LOWER_H}
              goldSide="right"
            />
          </g>
        )}

        {/* uniform_name テキスト（背番号の上の余白） */}
        <text
          x={CENTER_X}
          y="80"
          textAnchor="middle"
          dominantBaseline="central"
          fill={PRIMARY}
          style={{
            fontFamily: NUMBER_FONT,
            fontWeight: 700,
            fontSize: getNameFontSize(uniformName),
            letterSpacing: 8,
          }}
        >
          {uniformName}
        </text>

        {/* 背番号テキスト（名前と下部ストライプの間の余白） */}
        <text
          x={CENTER_X}
          y="168"
          textAnchor="middle"
          dominantBaseline="central"
          fill={PRIMARY}
          style={{
            fontFamily: NUMBER_FONT,
            fontWeight: 700,
            fontSize: getNumberFontSize(numberDisp),
          }}
        >
          {numberDisp}
        </text>
      </svg>
    </div>
  );
}
