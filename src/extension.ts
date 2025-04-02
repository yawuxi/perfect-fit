import { Extension, ExtensionMetadata } from 'resource:///org/gnome/shell/extensions/extension.js';
import Shell from 'gi://Shell'
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class PerfectFitExtension extends Extension {
  private _settings: Gio.Settings;
  private _focusSignalId: number | undefined;

  constructor(metadata: ExtensionMetadata) {
    super(metadata);
  }

  enable() {
    this._settings = this.getSettings();

    Main.wm.addKeybinding(
      'resize-and-fit',
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      () => {
        const window = global.display.get_focus_window();

        if (window) {
          const monitor = window.get_monitor();
          const monitorGeometry = global.display.get_monitor_geometry(monitor);

          const scaleFactor = this._settings.get_double('scale-factor');

          const newWindowWidth = monitorGeometry.width * scaleFactor;
          const newWindowHeight = monitorGeometry.height * scaleFactor - Main.panel.height;

          window.unmaximize(Meta.MaximizeFlags.BOTH);

          window.move_resize_frame(
            true,
            Math.floor((monitorGeometry.width - newWindowWidth) / 2),
            Math.floor((monitorGeometry.height - newWindowHeight + Main.panel.height) / 2),
            newWindowWidth,
            newWindowHeight
          );
        }
      }
    );
  }

  disable() {
    if (this._focusSignalId) {
      global.display.disconnect(this._focusSignalId)      
    }

    global.display.remove_keybinding('resize-and-fit');
  }
}
