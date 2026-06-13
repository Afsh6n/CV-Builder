export type FontFamilyId =
    | 'vazirmatn'
    | 'vazir'
    | 'iran-sans'
    | 'iran-yekan'
    | 'dana'
    | 'shabnam'
    | 'estedad'
    | 'sahel'
    | 'morabba'
    | 'kalameh';

export interface FontPreset {
    id: FontFamilyId;
    name: string;
    family: string;
    regularUrl: string;
    boldUrl?: string;
}

export const FONT_PRESETS = [
    { id: 'vazirmatn', name: 'وزیرمتن', family: 'Vazirmatn Local', regularUrl: '/font/vazirmatn/Vazirmatn-Regular.ttf', boldUrl: '/font/vazirmatn/Vazirmatn-Bold.ttf' },
    { id: 'vazir', name: 'وزیر', family: 'Vazir', regularUrl: '/font/vazir/Vazir.ttf', boldUrl: '/font/vazir/Vazir-Bold.ttf' },
    { id: 'iran-sans', name: 'ایران‌سنس', family: 'IRANSans', regularUrl: '/font/iran-sans/IRANSans.ttf', boldUrl: '/font/iran-sans/IRANSans_Bold.ttf' },
    { id: 'iran-yekan', name: 'ایران‌یکان', family: 'IRANYekan', regularUrl: '/font/iran-yekan/IRANYekanRegular.ttf', boldUrl: '/font/iran-yekan/IRANYekanExtraBold.ttf' },
    { id: 'dana', name: 'دانا', family: 'Dana', regularUrl: '/font/dana/dana-regular.ttf', boldUrl: '/font/dana/dana-bold.ttf' },
    { id: 'shabnam', name: 'شبنم', family: 'Shabnam', regularUrl: '/font/shabnam/Shabnam.ttf', boldUrl: '/font/shabnam/Shabnam-Bold.ttf' },
    { id: 'estedad', name: 'استعداد', family: 'Estedad', regularUrl: '/font/estedad/Estedad-Medium.ttf', boldUrl: '/font/estedad/Estedad-Bold.ttf' },
    { id: 'sahel', name: 'ساحل', family: 'Sahel', regularUrl: '/font/sahel/Sahel-FD.ttf', boldUrl: '/font/sahel/Sahel-Bold-FD.ttf' },
    { id: 'morabba', name: 'مربع', family: 'Morabba', regularUrl: '/font/morabba/Morabba-Regular.ttf', boldUrl: '/font/morabba/Morabba-Bold.ttf' },
    { id: 'kalameh', name: 'کلمه', family: 'Kalameh', regularUrl: '/font/kalameh/Kalameh_Regular.ttf', boldUrl: '/font/kalameh/Kalameh_Bold.ttf' },
] as const satisfies ReadonlyArray<FontPreset>;

export const DEFAULT_FONT_ID: FontFamilyId = 'vazirmatn';

export function getFontPreset(id: FontFamilyId): FontPreset {
    return FONT_PRESETS.find(f => f.id === id) ?? FONT_PRESETS[0];
}

export function fontFamilyCss(id: FontFamilyId): string {
    const preset = getFontPreset(id);
    return `'${preset.family}', 'Vazirmatn', Tahoma, sans-serif`;
}
