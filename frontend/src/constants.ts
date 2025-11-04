export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";
export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const ROLE_CLIENT = "client";
export const ROLE_MECHANIC = "mechanic";
export const ROLE_OWNER = "owner";
export const ROLE_ADMIN = "admin";
export const ROLE_ROOT = "root";

export const STATUS_ACTIVE = "active";
export const STATUS_INACTIVE = "inactive";
export const STATUS_PENDING = "pending";

// Dark theme color palette - Graphite & Steel tech look
export const COLOR_PRIMARY = "#3882F6"; // niebieski - techniczny, neutralny
export const COLOR_SECONDARY = "#22D3EE"; // cyan - nowoczesny
export const COLOR_BACKGROUND = "#0F1115"; // głęboki grafit - tło główne
export const COLOR_SURFACE = "#1A1D23"; // odróżniające się tło kart
export const COLOR_TEXT_PRIMARY = "#E4E6E8"; // subtelny jasny szary - tekst główny
export const COLOR_TEXT_SECONDARY = "#9CA3AF"; // dla opisów, metadanych
export const COLOR_WARNING = "#F59E0B"; // ostrzeżenie
export const COLOR_ERROR = "#EF4444"; // błąd
export const COLOR_SUCCESS = "#10B981"; // sukces

// Legacy colors for backward compatibility (will be removed)
export const COLOR_DARK = COLOR_BACKGROUND;
export const COLOR_LIGHT = COLOR_SURFACE;
