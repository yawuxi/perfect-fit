import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

class ShortcutSettingButton extends Gtk.Button {
  static {
      GObject.registerClass({
          Properties: {
              shortcut: GObject.ParamSpec.string(
                  'shortcut',
                  'shortcut',
                  'Keyboard shortcut',
                  GObject.ParamFlags.READWRITE,
                  '',
              ),
          },
      }, this);
  }

  private _shortcut: string;
  private _settingsKey: string;
  private _settings: Gio.Settings;
  private _label: Gtk.ShortcutLabel;

  constructor(settingsKey: string, settings: Gio.Settings) {
      super({ valign: Gtk.Align.CENTER, hexpand: false, has_frame: true });

      this._settingsKey = settingsKey;
      this._settings = settings;
      this._shortcut = settings.get_strv(settingsKey)[0] || '';
      this._label = new Gtk.ShortcutLabel({
          accelerator: this._shortcut,
          disabled_text: _('Set shortcut…'),
      });

      this.set_child(this._label);
      this.connect('clicked', () => this._openShortcutDialog());
  }

  private _openShortcutDialog() {
      const controller = new Gtk.EventControllerKey();

      const content = new Adw.StatusPage({
          title: _('Press a shortcut'),
          description: _('Press keys or Backspace to clear.'),
          icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
      });

      const dialog = new Adw.Window({
          modal: true,
          hide_on_close: true,
          transient_for: this.get_root() as Gtk.Window,
          content,
      });

      controller.connect('key-pressed', (_c, keyval, keycode, state) => {
          const mods = state & Gtk.accelerator_get_default_mod_mask();

          if (keyval === Gdk.KEY_Escape) {
              dialog.close();
              return Gdk.EVENT_STOP;
          }

          if (keyval === Gdk.KEY_BackSpace) {
              this._updateShortcut('');
              dialog.close();
              return Gdk.EVENT_STOP;
          }

          const accel = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mods);
          if (Gtk.accelerator_valid(keyval, mods)) {
              this._updateShortcut(accel);
              dialog.close();
          }

          return Gdk.EVENT_STOP;
      });

      dialog.add_controller(controller);
      dialog.present();
  }

  private _updateShortcut(accel: string) {
      this._shortcut = accel;
      this._label.set_accelerator(this._shortcut);
      this._settings.set_strv(this._settingsKey, [this._shortcut]);
  }
}

export default class PerfectFitPreferences extends ExtensionPreferences {
  async fillPreferencesWindow(window: Adw.PreferencesWindow) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage({
        title: _('General'),
        icon_name: 'dialog-information-symbolic',
    });

    window.add(page);

    const group = new Adw.PreferencesGroup({
        title: _('Window Behavior'),
    });

    page.add(group);

    const scaleRow = new Adw.ActionRow({
        title: _('Window scale factor'),
        subtitle: _('Resize window to % of screen'),
    });

    const scaleAdjustment = new Gtk.Adjustment({
        lower: 0.5,
        upper: 1.0,
        step_increment: 0.05,
        value: settings.get_double('scale-factor'),
    });

    const scaleSlider = new Gtk.Scale({
        orientation: Gtk.Orientation.HORIZONTAL,
        adjustment: scaleAdjustment,
        digits: 2,
        hexpand: true,
        draw_value: true,
    });

    scaleSlider.connect('value-changed', () => {
        settings.set_double('scale-factor', scaleSlider.get_value());
    });

    scaleRow.add_suffix(scaleSlider);
    scaleRow.activatable_widget = scaleSlider;
    group.add(scaleRow);

    const centerAndFitShortCutRow = new Adw.ActionRow({
      title: _('Center and fit'),
    });

    const centerAndFitShortCutButton = new ShortcutSettingButton('resize-and-fit', settings);
    centerAndFitShortCutRow.add_suffix(centerAndFitShortCutButton);
    centerAndFitShortCutRow.activatable_widget = centerAndFitShortCutButton;
    group.add(centerAndFitShortCutRow);

    const centerWithoutFitShortcutRow = new Adw.ActionRow({
        title: _('Center without fit'),
    });

    const centerWithoutFitShortCutButton = new ShortcutSettingButton('resize', settings);
    centerWithoutFitShortcutRow.add_suffix(centerWithoutFitShortCutButton);
    centerWithoutFitShortcutRow.activatable_widget = centerWithoutFitShortCutButton;
    group.add(centerWithoutFitShortcutRow);
  }
}
