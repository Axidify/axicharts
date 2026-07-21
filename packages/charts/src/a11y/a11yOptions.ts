export type ChartA11yKeyboardNavMode = "normal" | "serialize";

export type ChartA11yKeyboardOptions = {
  enabled?: boolean;
  mode?: ChartA11yKeyboardNavMode;
};

export type ChartA11yDataTableOptions = {
  showToggle?: boolean;
  visible?: boolean;
};

export type ChartA11yOptions = {
  keyboardNavigation?: boolean | ChartA11yKeyboardOptions;
  dataTable?: boolean | ChartA11yDataTableOptions;
};

export type ResolvedChartA11yKeyboard = {
  enabled: boolean;
  mode: ChartA11yKeyboardNavMode;
};

export type ResolvedChartA11yDataTable = {
  showToggle: boolean;
  visible: boolean;
};

export function resolveA11yKeyboardNav(
  option?: ChartA11yOptions["keyboardNavigation"],
): ResolvedChartA11yKeyboard {
  if (!option) {
    return { enabled: false, mode: "normal" };
  }
  if (option === true) {
    return { enabled: true, mode: "normal" };
  }
  return {
    enabled: option.enabled ?? true,
    mode: option.mode ?? "normal",
  };
}

export function resolveA11yDataTable(
  option?: ChartA11yOptions["dataTable"],
): ResolvedChartA11yDataTable {
  if (!option) {
    return { showToggle: false, visible: false };
  }
  if (option === true) {
    return { showToggle: true, visible: false };
  }
  return {
    showToggle: option.showToggle ?? true,
    visible: option.visible ?? false,
  };
}

export function isInteractiveA11y(options?: ChartA11yOptions): boolean {
  const keyboard = resolveA11yKeyboardNav(options?.keyboardNavigation);
  const dataTable = resolveA11yDataTable(options?.dataTable);
  return keyboard.enabled || dataTable.showToggle || dataTable.visible;
}
