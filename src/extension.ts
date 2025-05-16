/*
 * Perfect Fit — Perfect Fit is a GNOME extension that auto-centers windows and resizes them to 80% of the screen.
 * Copyright (C) 2025 Dmytro <ryliov.work@gmail.com> Rylov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Extension, ExtensionMetadata } from 'resource:///org/gnome/shell/extensions/extension.js';
import Shell from 'gi://Shell'
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class PerfectFitExtension extends Extension {
  private _settings: Gio.Settings | null;
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

          const scaleFactor = this._settings?.get_double('scale-factor') ?? 0.8;

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

    Main.wm.addKeybinding(
      'resize',
      this._settings,
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.NORMAL,
      () => {
        const window = global.display.get_focus_window();

        if (window) {
          const monitor = window.get_monitor();
          const monitorGeometry = global.display.get_monitor_geometry(monitor);

          const windowRect = window.get_frame_rect();

          window.unmaximize(Meta.MaximizeFlags.BOTH);

          window.move_frame(
            true,
            Math.floor((monitorGeometry.width - windowRect.width) / 2),
            Math.floor((monitorGeometry.height - windowRect.height + Main.panel.height) / 2),
          );
        }
      }
    );
  }

  disable() {
    if (this._focusSignalId) {
      global.display.disconnect(this._focusSignalId)      
    }

    Main.wm.removeKeybinding('resize-and-fit');
    Main.wm.removeKeybinding('resize');
    this._settings = null;
  }
}
