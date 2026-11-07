  // ===================== sound on/off: a button beside the paw at the top; every sound of the game goes through one volume knob =====================
  (function () {
    var muted = false; try { muted = localStorage.getItem("ham-mute") === "1"; } catch (e) { }
    var masters = [], media = new Set();
    if (window.AudioNode && window.AudioDestinationNode) {
      var _conn = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function (dest) {
        if (dest instanceof AudioDestinationNode) {
          var c = dest.context;
          if (!c.__hamMaster) { c.__hamMaster = c.createGain(); c.__hamMaster.gain.value = muted ? 0 : 1; _conn.call(c.__hamMaster, dest); masters.push(c.__hamMaster); }
          var args = Array.prototype.slice.call(arguments); args[0] = c.__hamMaster; return _conn.apply(this, args);
        }
        return _conn.apply(this, arguments);
      };
    }
    if (window.HTMLMediaElement) {
      var _play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () { media.add(this); if (muted) this.muted = true; else if (this.__hamMuted) this.muted = false; this.__hamMuted = muted; return _play.apply(this, arguments); };
    }
    function apply() {
      masters.forEach(function (g) { try { g.gain.value = muted ? 0 : 1; } catch (e) { } });
      media.forEach(function (m) { m.muted = muted; m.__hamMuted = muted; });
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/>' + (muted ? '<path d="M15 8.5l6 7M21 8.5l-6 7"/>' : '<path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/>') + '</svg>';
      btn.setAttribute("aria-label", muted ? "Ton an" : "Ton aus"); btn.classList.toggle("off", muted);
    }
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "close mapbtn soundbtn"; btn.id = "ham-sound-btn";
    var anchor = document.getElementById("ham-album-btn") || document.getElementById("map-btn");
    if (anchor) anchor.parentNode.insertBefore(btn, anchor);
    btn.addEventListener("click", function (e) { e.stopPropagation(); muted = !muted; try { localStorage.setItem("ham-mute", muted ? "1" : "0"); } catch (er) { } apply(); });
    apply();
    window.__sound = { muted: function () { return muted; } };
  })();
