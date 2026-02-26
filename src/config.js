/**
 * Supabase connection, discovery constants, and escapeHtml.
 * Change Supabase project, discovery countries, or XSS escaping here.
 */

/** School id for AURÉ (Mexico City). Used for Aure-specific package slots and admin UI. */
export const AURE_SCHOOL_ID = '38e570f9-5ca0-435e-8e99-70ebb5ae3b64';

export const SUPABASE_URL = 'https://fziyybqhecfxhkagknvg.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aXl5YnFoZWNmeGhrYWdrbnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDYwNDAsImV4cCI6MjA4NTk4MjA0MH0.wX7oIivqTbfBTMsIwI9zDgKk5x8P4mW3M543OgzwqCs';
export const supabaseClient = typeof window !== 'undefined' && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export const DISCOVERY_COUNTRIES_CITIES = {
    'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne', 'St. Gallen'],
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
    'Austria': ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma'],
    'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Cancún', 'Mérida'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Francisco'],
    'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg'],
    'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
    'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Bristol', 'Edinburgh', 'Glasgow'],
    'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
    'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Venice', 'Bologna'],
    'Portugal': ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'],
    'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège'],
    'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
    'Chile': ['Santiago', 'Valparaíso', 'Concepción'],
    'Peru': ['Lima', 'Arequipa', 'Trujillo'],
    'Ecuador': ['Quito', 'Guayaquil', 'Cuenca'],
    'Costa Rica': ['San José', 'Limón', 'Alajuela'],
    'Other': []
};
export const DISCOVERY_COUNTRIES = Object.keys(DISCOVERY_COUNTRIES_CITIES).sort();

export function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
