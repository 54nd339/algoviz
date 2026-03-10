"use client";

import { Button } from "@/components/ui";
import { controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";
import { cn } from "@/lib/utils";

const inputStyle = controlInputStyle;
const labelStyle = controlLabelStyle;

interface CipherControlsProps {
  algoId: string | undefined;
  caesarKey: number;
  caesarPlain: string;
  caesarMode: "encrypt" | "decrypt";
  onCaesarKeyChange: (v: number) => void;
  onCaesarPlainChange: (v: string) => void;
  onCaesarModeChange: (v: "encrypt" | "decrypt") => void;
  vigKey: string;
  vigPlain: string;
  vigMode: "encrypt" | "decrypt";
  onVigKeyChange: (v: string) => void;
  onVigPlainChange: (v: string) => void;
  onVigModeChange: (v: "encrypt" | "decrypt") => void;
  onApplyCaesar: () => void;
  onApplyVigenere: () => void;
}

export function CipherControls({
  algoId,
  caesarKey,
  caesarPlain,
  caesarMode,
  onCaesarKeyChange,
  onCaesarPlainChange,
  onCaesarModeChange,
  vigKey,
  vigPlain,
  vigMode,
  onVigKeyChange,
  onVigPlainChange,
  onVigModeChange,
  onApplyCaesar,
  onApplyVigenere,
}: CipherControlsProps) {
  if (algoId !== "caesar" && algoId !== "vigenere") return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {algoId === "caesar" && (
        <>
          <span className={labelStyle}>Key (shift):</span>
          <input
            type="number"
            min={0}
            max={25}
            value={caesarKey}
            onChange={(e) =>
              onCaesarKeyChange(
                Math.max(0, Math.min(25, Number(e.target.value) || 0)),
              )
            }
            className={cn(inputStyle, "w-12 text-center")}
          />
          <span className={labelStyle}>Mode:</span>
          <select
            value={caesarMode}
            onChange={(e) =>
              onCaesarModeChange(e.target.value as "encrypt" | "decrypt")
            }
            className={cn(inputStyle, "w-24")}
          >
            <option value="encrypt">Encrypt</option>
            <option value="decrypt">Decrypt</option>
          </select>
          <span className={labelStyle}>Text:</span>
          <input
            type="text"
            value={caesarPlain}
            onChange={(e) => onCaesarPlainChange(e.target.value)}
            className={cn(inputStyle, "w-40")}
          />
          <Button variant="outline" size="sm" onClick={onApplyCaesar}>
            Apply
          </Button>
        </>
      )}
      {algoId === "vigenere" && (
        <>
          <span className={labelStyle}>Keyword:</span>
          <input
            type="text"
            value={vigKey}
            onChange={(e) => onVigKeyChange(e.target.value.toUpperCase())}
            className={cn(inputStyle, "w-20")}
          />
          <span className={labelStyle}>Mode:</span>
          <select
            value={vigMode}
            onChange={(e) =>
              onVigModeChange(e.target.value as "encrypt" | "decrypt")
            }
            className={cn(inputStyle, "w-24")}
          >
            <option value="encrypt">Encrypt</option>
            <option value="decrypt">Decrypt</option>
          </select>
          <span className={labelStyle}>Text:</span>
          <input
            type="text"
            value={vigPlain}
            onChange={(e) => onVigPlainChange(e.target.value)}
            className={cn(inputStyle, "w-40")}
          />
          <Button variant="outline" size="sm" onClick={onApplyVigenere}>
            Apply
          </Button>
        </>
      )}
    </div>
  );
}
