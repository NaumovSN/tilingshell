import { Gio, GObject, GLib } from '@gi.shared';
import Layout from '../components/layout/Layout';
import Tile from '../components/layout/Tile';

export enum ActivationKey {
    NONE = -1,
    CTRL = 0,
    ALT,
    SUPER,
}

export abstract class Setting<T> {
    protected _name: string;

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    abstract get value(): T;
    abstract update(val: T): boolean;
}

export class BooleanSetting extends Setting<boolean> {
    get value(): boolean {
        return (
            Settings.gioSetting.get_boolean(this._name) ??
            Settings.gioSetting.get_default_value(this._name)?.get_boolean()
        );
    }

    update(val: boolean): boolean {
        return Settings.gioSetting.set_boolean(this._name, val);
    }
}

export class StringSetting extends Setting<string> {
    get value(): string {
        return (
            Settings.gioSetting.get_string(this._name) ??
            Settings.gioSetting.get_default_value(this._name)?.get_string()[0]
        );
    }

    update(val: string): boolean {
        return Settings.gioSetting.set_string(this._name, val);
    }
}

export class NumberSetting extends Setting<number> {
    get value(): number {
        return (
            Settings.gioSetting.get_int(this._name) ??
            Settings.gioSetting.get_default_value(this._name)?.get_int64()
        );
    }

    update(val: number): boolean {
        return Settings.gioSetting.set_int(this._name, val);
    }
}

export class UnsignedNumberSetting extends NumberSetting {
    get value(): number {
        return (
            Settings.gioSetting.get_uint(this._name) ??
            Settings.gioSetting.get_default_value(this._name)?.get_uint64()
        );
    }

    update(val: number): boolean {
        return Settings.gioSetting.set_uint(this._name, val);
    }
}

export class ActivationKeySetting extends Setting<ActivationKey> {
    private _defaultValueString: string;

    constructor(name: string, defaultValue: ActivationKey) {
        super(name);
        this._defaultValueString = defaultValue.toString();
    }

    get value(): ActivationKey {
        let val = Settings.gioSetting.get_strv(this._name);
        if (!val || val.length === 0) {
            val = Settings.gioSetting
                .get_default_value(this._name)
                ?.get_strv() ?? [this._defaultValueString];
            if (val.length === 0) val = [this._defaultValueString];
        }
        return Number(val[0]);
    }

    update(val: ActivationKey): boolean {
        return Settings.gioSetting.set_strv(this._name, [String(val)]);
    }
}

export default class Settings {
    static _settings: Gio.Settings | null;
    static _is_initialized: boolean = false;

    static LAST_VERSION_NAME_INSTALLED = new StringSetting(
        'last-version-name-installed',
    );
    static OVERRIDDEN_SETTINGS = new StringSetting('overridden-settings');
    static TILING_SYSTEM = new BooleanSetting('enable-tiling-system');
    static TILING_SYSTEM_ACTIVATION_KEY = new ActivationKeySetting(
        'tiling-system-activation-key',
        ActivationKey.CTRL,
    );
    static TILING_SYSTEM_DEACTIVATION_KEY = new ActivationKeySetting(
        'tiling-system-deactivation-key',
        ActivationKey.NONE,
    );
    static SNAP_ASSIST = new BooleanSetting('enable-snap-assist');
    static SHOW_INDICATOR = new BooleanSetting('show-indicator');
    static INNER_GAPS = new UnsignedNumberSetting('inner-gaps');
    static OUTER_GAPS = new UnsignedNumberSetting('outer-gaps');
    static SPAN_MULTIPLE_TILES = new BooleanSetting(
        'enable-span-multiple-tiles',
    );
    static SPAN_MULTIPLE_TILES_ACTIVATION_KEY = new ActivationKeySetting(
        'span-multiple-tiles-activation-key',
        ActivationKey.ALT,
    );
    static SETTING_LAYOUTS_JSON = 'layouts-json';
    static SETTING_SELECTED_LAYOUTS = 'selected-layouts';
    static RESTORE_WINDOW_ORIGINAL_SIZE = new BooleanSetting(
        'restore-window-original-size',
    );
    static RESIZE_COMPLEMENTING_WINDOWS = new BooleanSetting(
        'resize-complementing-windows',
    );
    static ENABLE_BLUR_SNAP_ASSISTANT = new BooleanSetting(
        'enable-blur-snap-assistant',
    );
    static ENABLE_BLUR_SELECTED_TILEPREVIEW = new BooleanSetting(
        'enable-blur-selected-tilepreview',
    );
    static ENABLE_MOVE_KEYBINDINGS = new BooleanSetting(
        'enable-move-keybindings',
    );
    static ENABLE_AUTO_TILING = new BooleanSetting('enable-autotiling');
    static ACTIVE_SCREEN_EDGES = new BooleanSetting('active-screen-edges');
    static TOP_EDGE_MAXIMIZE = new BooleanSetting('top-edge-maximize');
    static OVERRIDE_WINDOW_MENU = new BooleanSetting('override-window-menu');
    static SNAP_ASSISTANT_THRESHOLD = new NumberSetting(
        'snap-assistant-threshold',
    );
    static QUARTER_TILING_THRESHOLD = new UnsignedNumberSetting(
        'quarter-tiling-threshold',
    );
    static WINDOW_BORDER_COLOR = new StringSetting('window-border-color');
    static WINDOW_BORDER_WIDTH = new UnsignedNumberSetting(
        'window-border-width',
    );
    static ENABLE_WINDOW_BORDER = new BooleanSetting('enable-window-border');
    static SNAP_ASSISTANT_ANIMATION_TIME = new UnsignedNumberSetting(
        'snap-assistant-animation-time',
    );
    static TILE_PREVIEW_ANIMATION_TIME = new UnsignedNumberSetting(
        'tile-preview-animation-time',
    );

    static SETTING_MOVE_WINDOW_RIGHT = 'move-window-right';
    static SETTING_MOVE_WINDOW_LEFT = 'move-window-left';
    static SETTING_MOVE_WINDOW_UP = 'move-window-up';
    static SETTING_MOVE_WINDOW_DOWN = 'move-window-down';
    static SETTING_SPAN_WINDOW_RIGHT = 'span-window-right';
    static SETTING_SPAN_WINDOW_LEFT = 'span-window-left';
    static SETTING_SPAN_WINDOW_UP = 'span-window-up';
    static SETTING_SPAN_WINDOW_DOWN = 'span-window-down';
    static SETTING_SPAN_WINDOW_ALL_TILES = 'span-window-all-tiles';
    static SETTING_UNTILE_WINDOW = 'untile-window';
    static SETTING_MOVE_WINDOW_CENTER = 'move-window-center';
    static SETTING_FOCUS_WINDOW_RIGHT = 'focus-window-right';
    static SETTING_FOCUS_WINDOW_LEFT = 'focus-window-left';
    static SETTING_FOCUS_WINDOW_UP = 'focus-window-up';
    static SETTING_FOCUS_WINDOW_DOWN = 'focus-window-down';

    static initialize(settings: Gio.Settings) {
        if (this._is_initialized) return;

        this._is_initialized = true;
        this._settings = settings;
    }

    static destroy() {
        if (this._is_initialized) {
            this._is_initialized = false;
            this._settings = null;
        }
    }

    static get gioSetting(): Gio.Settings {
        return this._settings ?? new Gio.Settings();
    }

    static bind<T>(
        sett: Setting<T>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        object: GObject.Object | any,
        property: string,
        flags: Gio.SettingsBindFlags = Gio.SettingsBindFlags.DEFAULT,
    ): void {
        this._settings?.bind(sett.name, object, property, flags);
    }

    static get_inner_gaps(scaleFactor: number = 1): {
        top: number;
        bottom: number;
        left: number;
        right: number;
    } {
        // get the gaps settings and scale by scale factor
        const value = this.INNER_GAPS.value * scaleFactor;
        return {
            top: value,
            bottom: value,
            left: value,
            right: value,
        };
    }

    static get_outer_gaps(scaleFactor: number = 1): {
        top: number;
        bottom: number;
        left: number;
        right: number;
    } {
        // get the gaps settings and scale by scale factor
        const value = this.OUTER_GAPS.value * scaleFactor;
        return {
            top: value,
            bottom: value,
            left: value,
            right: value,
        };
    }

    static get_layouts_json(): Layout[] {
        try {
            const layouts = JSON.parse(
                this._settings?.get_string(this.SETTING_LAYOUTS_JSON) || '[]',
            ) as Layout[];
            if (layouts.length === 0)
                throw new Error('At least one layout is required');
            return layouts.filter((layout) => layout.tiles.length > 0);
        } catch (ex: unknown) {
            this.reset_layouts_json();
            return JSON.parse(
                this._settings?.get_string(this.SETTING_LAYOUTS_JSON) || '[]',
            ) as Layout[];
        }
    }

    static get_selected_layouts(): string[][] {
        const variant = this._settings?.get_value(
            Settings.SETTING_SELECTED_LAYOUTS,
        );
        if (!variant) return [];

        const result: string[][] = [];
        // for each monitor
        for (let i = 0; i < variant.n_children(); i++) {
            const monitor_variant = variant.get_child_value(i);
            if (!monitor_variant) continue;

            const n_workspaces = monitor_variant.n_children();
            const monitor_result: string[] = [];
            // for each workspace
            for (let j = 0; j < n_workspaces; j++) {
                const layout_variant = monitor_variant.get_child_value(j);
                if (!layout_variant) continue;

                monitor_result.push(layout_variant.get_string()[0]);
            }
            result.push(monitor_result);
        }
        return result;
    }

    static reset_layouts_json() {
        this.save_layouts_json([
            new Layout(
                [
                    new Tile({
                        x: 0,
                        y: 0,
                        height: 0.5,
                        width: 0.22,
                        groups: [1, 2],
                    }), // top-left
                    new Tile({
                        x: 0,
                        y: 0.5,
                        height: 0.5,
                        width: 0.22,
                        groups: [1, 2],
                    }), // bottom-left
                    new Tile({
                        x: 0.22,
                        y: 0,
                        height: 1,
                        width: 0.56,
                        groups: [2, 3],
                    }), // center
                    new Tile({
                        x: 0.78,
                        y: 0,
                        height: 0.5,
                        width: 0.22,
                        groups: [3, 4],
                    }), // top-right
                    new Tile({
                        x: 0.78,
                        y: 0.5,
                        height: 0.5,
                        width: 0.22,
                        groups: [3, 4],
                    }), // bottom-right
                ],
                'Layout 1',
            ),
            new Layout(
                [
                    new Tile({
                        x: 0,
                        y: 0,
                        height: 1,
                        width: 0.22,
                        groups: [1],
                    }),
                    new Tile({
                        x: 0.22,
                        y: 0,
                        height: 1,
                        width: 0.56,
                        groups: [1, 2],
                    }),
                    new Tile({
                        x: 0.78,
                        y: 0,
                        height: 1,
                        width: 0.22,
                        groups: [2],
                    }),
                ],
                'Layout 2',
            ),
            new Layout(
                [
                    new Tile({
                        x: 0,
                        y: 0,
                        height: 1,
                        width: 0.33,
                        groups: [1],
                    }),
                    new Tile({
                        x: 0.33,
                        y: 0,
                        height: 1,
                        width: 0.67,
                        groups: [1],
                    }),
                ],
                'Layout 3',
            ),
            new Layout(
                [
                    new Tile({
                        x: 0,
                        y: 0,
                        height: 1,
                        width: 0.67,
                        groups: [1],
                    }),
                    new Tile({
                        x: 0.67,
                        y: 0,
                        height: 1,
                        width: 0.33,
                        groups: [1],
                    }),
                ],
                'Layout 4',
            ),
        ]);
    }

    static save_layouts_json(layouts: Layout[]) {
        this._settings?.set_string(
            this.SETTING_LAYOUTS_JSON,
            JSON.stringify(layouts),
        );
    }

    static save_selected_layouts(ids: string[][]) {
        if (ids.length === 0) {
            this._settings?.reset(Settings.SETTING_SELECTED_LAYOUTS);
            return;
        }
        const variants = ids.map((monitor_ids) =>
            GLib.Variant.new_strv(monitor_ids),
        );
        const result = GLib.Variant.new_array(null, variants);
        // @ts-expect-error "'result' is of a correct variant type"
        this._settings?.set_value(Settings.SETTING_SELECTED_LAYOUTS, result);
    }

    static connect(key: string, func: (...arg: unknown[]) => void): number {
        return this._settings?.connect(`changed::${key}`, func) || -1;
    }

    static disconnect(id: number) {
        this._settings?.disconnect(id);
    }
}
