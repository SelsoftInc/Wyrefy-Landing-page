"use client";

import { SelectField } from "@/src/components/ui/form-field";

export function ModelCacheModeField({ className, defaultValue = "" }: Readonly<{ className?: string; defaultValue?: string }>) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <SelectField
        label="Cache mode"
        name="cache_mode"
        defaultValue={defaultValue}
        className="w-full"
      >
        <option value="">Auto detect</option>
        <option value="none">No cache</option>
        <option value="explicit_context_cache">Explicit context cache</option>
        <option value="provider_implicit_cache">Provider implicit cache</option>
      </SelectField>
    </div>
  );
}
