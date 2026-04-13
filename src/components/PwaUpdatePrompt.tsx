import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

const BANNER_PAD = "4.5rem";
const UPDATE_POLL_MS = 5 * 60 * 1000;

function checkServiceWorkerUpdate() {
  if (!("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.getRegistration().then((r) => {
    void r?.update();
  });
}

/**
 * Banner keď je nový service worker (nový deploy) alebo prvý offline režim.
 * Vyžaduje registerType: "prompt" vo vite-plugin-pwa.
 *
 * Pri `npm run dev` musí byť vo vite `devOptions.enabled: true` — inak vite-plugin-pwa
 * nahradí tento modul prázdnym stubom (`needRefresh` / `offlineReady` ostanú vždy false).
 */
export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      console.warn("[PWA] registrácia zlyhala:", err);
    },
    onRegisteredSW(_swUrl, r) {
      if (r) void r.update();
    },
  });

  useEffect(() => {
    const tick = () => checkServiceWorkerUpdate();
    const id = window.setInterval(tick, UPDATE_POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    window.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", tick);
    tick();
    return () => {
      window.clearInterval(id);
      window.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", tick);
    };
  }, []);

  const visible = needRefresh || offlineReady;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--pwa-update-pad",
      visible ? BANNER_PAD : "0px",
    );
    return () => {
      document.documentElement.style.removeProperty("--pwa-update-pad");
    };
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] border-b border-brand-400/50 bg-slate-950 px-4 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))] shadow-xl shadow-black/40 ring-1 ring-brand-500/30 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <p className="min-w-0 flex-1 text-sm leading-snug text-slate-200">
          {needRefresh ? (
            <>
              Je dostupná <strong className="text-brand-300">nová verzia</strong> aplikácie — stlač
              Obnoviť a načíta sa najnovší build.
            </>
          ) : (
            <>
              Aplikácia je pripravená na <strong className="text-brand-300">offline</strong> použitie.
            </>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {needRefresh && (
            <button
              type="button"
              onClick={() => void updateServiceWorker(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Obnoviť
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
            aria-label={needRefresh ? "Zavrieť upozornenie" : "Zavrieť"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
