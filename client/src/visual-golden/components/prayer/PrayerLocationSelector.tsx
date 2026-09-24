import { useEffect, useMemo, useState } from "react";
import { MapPin, Star } from "lucide-react";
import { countriesFromCatalog, citiesForCountry, findLocation, PRAYER_LOCATIONS, type PrayerLocation } from "@/visual-golden/services/prayer";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { t } from "@/visual-golden/lib/i18n";
import styles from "./prayer.module.css";

interface Props {
  location: PrayerLocation;
  onSelect: (loc: PrayerLocation) => void;
  onGeo: () => void;
  geoBusy?: boolean;
}

export function PrayerLocationSelector({ location, onSelect, onGeo, geoBusy }: Props) {
  const lang = useInstitution((s) => s.lang);
  const [country, setCountry] = useState(location.countryCode === "GPS" ? "AE" : location.countryCode);
  const [q, setQ] = useState("");
  const countries = countriesFromCatalog();
  const recentIds = useInstitution((s) => s.recentLocationIds);
  const recents = recentIds.map((id) => findLocation(id)).filter((x): x is PrayerLocation => Boolean(x));

  useEffect(() => {
    if (location.countryCode !== "GPS") setCountry(location.countryCode);
  }, [location.countryCode, location.id]);

  const cities = useMemo(() => {
    const base = country ? citiesForCountry(country) : PRAYER_LOCATIONS;
    const n = q.trim();
    if (!n) return base;
    return base.filter((c) => c.cityAr.includes(n) || c.cityEn.toLowerCase().includes(n.toLowerCase()));
  }, [country, q]);

  const favIds = useInstitution((s) => s.favorites)
    .filter((f) => f.path.startsWith("loc:"))
    .map((f) => f.id);
  const toggleFav = useInstitution((s) => s.toggleFavorite);

  return (
    <div>
      <div className={styles.locHead}>
        <div>
          <h3>{lang === "ar" ? location.cityAr : location.cityEn}</h3>
          <p>{lang === "ar" ? location.countryAr : location.countryEn}</p>
        </div>
        <button type="button" className={styles.goldBtn} onClick={onGeo} disabled={geoBusy}>
          <MapPin size={14} />
          {geoBusy ? "…" : t(lang, "useLocation")}
        </button>
      </div>
      <div className={styles.selects}>
        <label>
          {lang === "ar" ? "الدولة" : "Country"}
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              const first = citiesForCountry(e.target.value)[0];
              if (first) onSelect(first);
            }}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {lang === "ar" ? c.ar : c.en}
              </option>
            ))}
          </select>
        </label>
        <label>
          {lang === "ar" ? "المدينة" : "City"}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن مدينة…" : "Search a city…"}
            aria-label={lang === "ar" ? "بحث المدينة" : "City search"}
          />
        </label>
      </div>
      {recents.length ? (
        <div className={styles.chips} aria-label={lang === "ar" ? "مواقع أخيرة" : "Recent"}>
          {recents.slice(0, 5).map((c) => (
            <button key={c.id} type="button" className={c.id === location.id ? styles.chipOn : ""} onClick={() => onSelect(c)}>
              {lang === "ar" ? c.cityAr : c.cityEn}
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.chips} role="listbox" aria-label={lang === "ar" ? "المدن" : "Cities"}>
        {cities.slice(0, 12).map((c) => (
          <button key={c.id} type="button" className={c.id === location.id ? styles.chipOn : ""} onClick={() => onSelect(c)}>
            {lang === "ar" ? c.cityAr : c.cityEn}
          </button>
        ))}
      </div>
      <div className={styles.rowBtns}>
        <button
          type="button"
          onClick={() =>
            toggleFav({
              id: `loc:${location.id}`,
              title: lang === "ar" ? location.cityAr : location.cityEn,
              path: `loc:${location.id}`,
            })
          }
        >
          <Star size={14} />
          {favIds.includes(`loc:${location.id}`)
            ? lang === "ar"
              ? "في المفضلة"
              : "Saved"
            : lang === "ar"
              ? "حفظ الموقع"
              : "Save location"}
        </button>
      </div>
    </div>
  );
}
