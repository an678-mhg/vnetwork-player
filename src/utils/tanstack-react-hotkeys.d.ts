declare module "@tanstack/react-hotkeys" {
  type HotkeyDefinition = {
    hotkey: string;
    callback: (event: KeyboardEvent) => void;
  };

  type HotkeyOptions = {
    ignoreInputs?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  };

  export function useHotkeys(
    hotkeys: HotkeyDefinition[],
    commonOptions?: HotkeyOptions,
  ): void;
}
