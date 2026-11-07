  // Bestenliste in der App: Anbindung von mountObstsalat(…, { board }) an den Worker "sudoku-sync".
  // obstsalatBoard(SYNC_URL, getAccount) -> { submit(score) }; getAccount() liefert { name, pin } oder null (nicht angemeldet).
  // Ohne Konto wird nur die Liste geladen; die eigene Zeile zeigt dann den Bestwert auf diesem Gerät.
function obstsalatBoard(SYNC_URL, getAccount) {
  function post(path, body) {
    var req = fetch(SYNC_URL + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (res) { return res.json(); });
    return Promise.race([req, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, 10000); })]);
  }
  return {
    submit: function (score) {
      var acc = getAccount && getAccount();
      var call = acc && score > 0 ? post("/api/score", { game: "obstsalat", name: acc.name, pin: acc.pin, score: score })
                                  : post("/api/top", { game: "obstsalat", name: acc ? acc.name : undefined });
      return call.then(function (r) {
        if (!r || !r.ok) throw new Error(r && r.error || "network");
        var key = r.me ? r.me.name.toLowerCase() : null, rows = r.rows.map(function (x) { return { name: x.name, score: x.score, me: key !== null && x.name.toLowerCase() === key }; });
        if (r.me && !rows.some(function (x) { return x.me; })) rows.push({ name: r.me.name, score: r.me.score, me: true });
        return { rows: rows, rank: r.me ? r.me.rank : null };
      });
    }
  };
}
