// Standalone recovery: no application imports, and no access to profile or media storage.
(function () {
  var button = document.getElementById('repair');
  var status = document.getElementById('status');
  var base = new URL('./', location.href);
  var busy = false;

  button.addEventListener('click', async function () {
    if (busy) return;
    busy = true;
    button.disabled = true;
    status.textContent = 'Rechargement de FrayFit… Vos données sont conservées.';
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        var registrations = await navigator.serviceWorker.getRegistrations();
        for (var registration of registrations) {
          if (registration.scope !== base.href) continue;
          var workers = [registration.active, registration.waiting, registration.installing];
          var ours = workers.some(function (worker) {
            if (!worker) return false;
            var url = new URL(worker.scriptURL);
            return url.origin === base.origin && url.pathname === base.pathname + 'sw.js';
          });
          if (ours) await registration.unregister();
        }
      }
      if (typeof caches !== 'undefined') {
        var names = await caches.keys();
        for (var name of names) {
          if (name.indexOf('opengym-rt-') === 0) await caches.delete(name);
        }
      }
      var destination = new URL(base.href);
      destination.searchParams.set('frayfit_reload', String(Date.now()));
      location.replace(destination.href);
    } catch (error) {
      status.textContent = 'Le rechargement n’a pas abouti. Réessayez avec une connexion disponible. Vos données sont conservées.';
      busy = false;
      button.disabled = false;
    }
  });
})();
