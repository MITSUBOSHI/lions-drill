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
// "vertical": 中央縦ストライプ / "sleeve": 袖口2本線+アーチ名 / "none": 装飾なし
const STYLE = TEAM.uniform.svg.stripeStyle;

/*
 * viewBox 480x370
 * 袖を大きく確保し、実物のTシャツに近いシルエット
 * 袖:身頃:袖 ≈ 20%:60%:20%
 */
const UNIFORM_PATH =
  "M 140,0 L 0,40 L 40,128 L 90,120 Q 92,150 95,175 L 95,348 Q 95,363 115,363 L 365,363 Q 385,363 385,348 L 385,175 Q 388,150 390,120 L 440,128 L 480,40 L 340,0 Z";

const CENTER_X = 240;

/* 中央縦ストライプ（vertical用） */
const STRIPE_W = 22;
const STRIPE_GAP = 10;
const LEFT_X = CENTER_X - STRIPE_GAP / 2 - STRIPE_W;
const RIGHT_X = CENTER_X + STRIPE_GAP / 2;
const STRIPE_UPPER_Y = 10;
const STRIPE_UPPER_H = 48;
const STRIPE_LOWER_Y = 233;
const STRIPE_LOWER_H = 130;

function getNameFontSize(name: string): number {
  if (name.length > 10) return 24;
  if (name.length > 8) return 30;
  if (name.length > 6) return 36;
  return 44;
}

function getNumberFontSize(numberDisp: string): number {
  const big = STYLE === "sleeve";
  if (numberDisp.length > 2) return big ? 105 : 90;
  return big ? 150 : 130;
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
  const arcId = `${clipPathId}-arc`;
  const isSleeve = STYLE === "sleeve";
  const numberFontSize = getNumberFontSize(numberDisp);

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      <svg
        viewBox="0 0 480 370"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label={`${uniformName} ${numberDisp}番のユニフォーム背面`}
      >
        <defs>
          <clipPath id={clipPathId}>
            <path d={UNIFORM_PATH} />
          </clipPath>
          {isSleeve && (
            <path id={arcId} d="M 98,120 Q 240,50 382,120" fill="none" />
          )}
        </defs>

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

        {/* 中央縦ストライプ（vertical） */}
        {STYLE === "vertical" && (
          <g clipPath={`url(#${clipPathId})`}>
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

        {/* 袖口の2本線（sleeve） */}
        {isSleeve && (
          <g clipPath={`url(#${clipPathId})`} fill="none" strokeLinecap="butt">
            {/* 左袖：袖先端エッジ(0,40)-(40,128)に沿った2本 */}
            <line
              x1="6"
              y1="44"
              x2="46"
              y2="132"
              stroke={PRIMARY}
              strokeWidth="7"
            />
            <line
              x1="18"
              y1="39"
              x2="58"
              y2="127"
              stroke={ACCENT}
              strokeWidth="5"
            />
            {/* 右袖：袖先端エッジ(440,128)-(480,40)に沿った2本（左右対称） */}
            <line
              x1="474"
              y1="44"
              x2="434"
              y2="132"
              stroke={PRIMARY}
              strokeWidth="7"
            />
            <line
              x1="462"
              y1="39"
              x2="422"
              y2="127"
              stroke={ACCENT}
              strokeWidth="5"
            />
          </g>
        )}

        {/* 選手名 */}
        {isSleeve ? (
          <text
            fill={PRIMARY}
            stroke="#FFFFFF"
            strokeWidth="0.8"
            paintOrder="stroke"
            style={{
              fontFamily: NUMBER_FONT,
              fontWeight: 700,
              fontSize: Math.min(getNameFontSize(uniformName), 40),
              letterSpacing: 3,
            }}
          >
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              {uniformName}
            </textPath>
          </text>
        ) : (
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
        )}

        {/* 背番号 */}
        <text
          x={CENTER_X}
          y={isSleeve ? "215" : "168"}
          textAnchor="middle"
          dominantBaseline="central"
          fill={PRIMARY}
          stroke={isSleeve ? "#FFFFFF" : undefined}
          strokeWidth={isSleeve ? 2.5 : undefined}
          paintOrder="stroke"
          style={{
            fontFamily: NUMBER_FONT,
            fontWeight: isSleeve ? 900 : 700,
            fontSize: numberFontSize,
          }}
        >
          {numberDisp}
        </text>
      </svg>
    </div>
  );
}
