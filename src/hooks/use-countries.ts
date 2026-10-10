
import { useEffect, useState } from "react";

type Country = {
  names: {
    common: string;
  };
};

type CountriesApiResponse = {
  data: {
    objects: Country[];
  };
};

const PAGE_SIZE = 100;

const API_URL = "https://api.restcountries.com/countries/v5";

export function useCountries() {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCountries() {
      try {
        setLoading(true);
        setError(null);

        const allCountryNames: string[] = [];
        let offset = 0;

        while (true) {
          const params = new URLSearchParams({
            limit: String(PAGE_SIZE),
            offset: String(offset),
            response_fields: "names.common",
          });

          const apiKey =
            process.env.NEXT_PUBLIC_REST_COUNTRIES_API_KEY;

          const response = await fetch(
            `${API_URL}?${params.toString()}`,
            {
              signal: controller.signal,
              headers: apiKey
                ? {
                    Authorization: `Bearer ${apiKey}`,
                  }
                : {},
            }
          );

          if (!response.ok) {
            throw new Error(
              `Country API error: ${response.status} ${response.statusText}`
            );
          }

          const result =
            (await response.json()) as CountriesApiResponse;

          const pageCountries = (result.data?.objects ?? [])
            .map((country) => country.names?.common)
            .filter(
              (name): name is string =>
                typeof name === "string" && name.trim().length > 0
            );

          allCountryNames.push(...pageCountries);

          // Stop when the API returns fewer than 100 results.
          if (pageCountries.length < PAGE_SIZE) {
            break;
          }

          offset += PAGE_SIZE;
        }

        if (!controller.signal.aborted) {
          const uniqueCountries = [
            ...new Set(allCountryNames),
          ].sort((a, b) => a.localeCompare(b));

          setCountries(uniqueCountries);

        //   console.log(
        //     `Successfully loaded ${uniqueCountries.length} countries.`
        //   );
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
          console.error("Country loading failed:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCountries();

    return () => controller.abort();
  }, []);

  return { countries, loading, error };
}