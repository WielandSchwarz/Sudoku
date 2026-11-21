# Morse conversations for the lighthouse wireless room -> morse_conv.json
# S(ship message, replies...) / R(our reply, ship answer). The lighthouse's call sign is LT.
import json, re
def S(m, *r): return {"s": m, "r": list(r)} if r else {"s": m}
def R(m, n): return {"m": m, "n": n}

EASY = [
 S("GM LT", R("GM", S("WX OK?", R("YES", S("FB 73")), R("FOG", S("R TU 73")))), R("HI OM", S("HI HW?", R("FB", S("TU 73")), R("TIRED", S("HI HI GN"))))),
 S("HELLO LT", R("HELLO", S("HW?", R("GOOD", S("FB 73")), R("OK", S("R GN")))), R("WHO?", S("DE GULL", R("HI", S("HI 73")), R("TU", S("GN SK"))))),
 S("GE LT", R("GE", S("SUN HR", R("FB", S("TU 73")), R("NICE", S("YES 73")))), R("HI", S("HI OM", R("WX?", S("WIND 73")), R("GE OM", S("TU GN"))))),
 S("SOS", R("WHERE?", S("PORT", R("OK", S("TU TU")), R("COMING", S("FB 73")))), R("R", S("MAST GONE", R("HELP?", S("YES TU")), R("OK", S("R SK"))))),
 S("CQ", R("LT", S("HI LT", R("HI", S("WX?", R("SUN", S("FB 73")), R("RAIN", S("SRI 73")))), R("GM", S("GM OM 73")))), R("HI", S("DE OTTER", R("HI", S("FISH?", R("YES", S("FB GN")), R("NO", S("SRI 73")))), R("GM", S("GM 73"))))),
 S("FISH?", R("YES", S("WHERE?", R("PORT", S("TU 73")), R("NORTH", S("FB GN")))), R("NO", S("SRI", R("OK", S("73")), R("SOON", S("R 73"))))),
 S("ICE HR", R("R", S("TU", R("GL", S("TU GL")), R("73", S("73 SK")))), R("WHERE?", S("NORTH", R("TU", S("R 73")), R("OK", S("GN"))))),
 S("TEA?", R("YES", S("FB HI", R("TU", S("73")), R("SUGAR", S("HI HI GN")))), R("NO", S("COCOA?", R("YES", S("FB 73")), R("NO", S("OK GN"))))),
 S("GN LT", R("GN", S("TU OM", R("73", S("73 SK")), R("88", S("HI 88")))), R("SO SOON?", S("YES TIRED", R("OK", S("GN 73")), R("SLEEP", S("TU GN"))))),
 S("FOG", R("R", S("LIGHT?", R("YES", S("TU TU")), R("ON", S("FB 73")))), R("HERE", S("THICK?", R("YES", S("R 73")), R("BIT", S("OK TU"))))),
 S("HUNGRY", R("FISH", S("FB", R("GOOD?", S("YES TU")), R("73", S("73")))), R("CAKE?", S("YES TU", R("MORE?", S("YES HI")), R("OK", S("FB GN"))))),
 S("WIND?", R("YES", S("STRONG?", R("YES", S("R TU")), R("NO", S("FB 73")))), R("NO", S("FB", R("SUN", S("NICE 73")), R("CALM", S("TU GN"))))),
]

MEDIUM = [
 S("CQ DE GULL", R("DE LT K", S("GM OM UR WX?", R("SUNNY", S("FB TU 73")), R("RAIN", S("SRI OM 73")))), R("QRZ?", S("DE GULL K", R("GM OM", S("GM TU K")), R("R TU", S("73 SK"))))),
 S("LT DE ANNA K", R("R K", S("QTH PORT", R("FB", S("TU 73 SK")), R("WELCOME", S("TU OM 73")))), R("GE OM", S("GE UR WX?", R("FOG", S("R TU K")), R("CLEAR", S("FB 73"))))),
 S("FOG HR THICK", R("R LIGHT ON", S("TU OM FB", R("GL", S("TU GL 73")), R("73", S("73 SK")))), R("QTH?", S("NEAR PORT", R("PSE SLOW", S("R TU")), R("R K", S("FB 73"))))),
 S("PSE RPT", R("PORT OPEN", S("R TU", R("AR", S("73 SK")), R("CUL", S("CUL 73")))), R("QRM HR", S("RPT AGN?", R("YES", S("R K")), R("NO", S("OK 73"))))),
 S("MSG FOR LT", R("R K", S("MAIL TMW", R("FB TU", S("73")), R("WHEN?", S("EARLY 73")))), R("PSE AGN", S("MSG FOR LT", R("R TU", S("FB K")), R("QSL", S("TU 73 SK"))))),
 S("SOS MAST BROKE", R("QTH?", S("NORTH CAPE", R("R COMING", S("TU TU OM")), R("BOAT SENT", S("FB TU")))), R("R R", S("WATER IN HULL", R("PUMP", S("R TU")), R("BOAT SENT", S("TU OM 73"))))),
 S("GM HW UR WX?", R("WX SUNNY", S("FB HR TOO", R("NICE", S("TU 73")), R("CUL", S("CUL OM")))), R("WX RAIN", S("SRI OM", R("NIL", S("HI HI 73")), R("TU", S("73 SK"))))),
 S("ICE IN PORT?", R("NO", S("FB TU", R("GL", S("TU 73")), R("COMING?", S("YES TMW")))), R("YES A BIT", S("R SLOW", R("FB", S("TU 73")), R("GL OM", S("TU GL"))))),
 S("CQ CQ DE OTTER", R("DE LT K", S("HI LT ES FISH", R("FB", S("TU 73")), R("MANY?", S("YES 10 BOXES")))), R("GE OTTER", S("GE OM UR QTH?", R("LT HR", S("FB 73")), R("PORT", S("R TU"))))),
 S("TNX FOR LIGHT", R("NP OM", S("FB 73 SK", R("73", S("SK")), R("CUL", S("CUL 73")))), R("ANY TIME", S("HI HI FB", R("GL", S("TU GL")), R("73", S("73 SK"))))),
 S("SRI QRM HR", R("PSE AGN", S("RPT WX OK", R("R TU", S("73")), R("QSL", S("FB 73")))), R("QSL?", S("QSL TU OM", R("73", S("73 SK")), R("CUL", S("CUL OM"))))),
 S("GN LT 88", R("GN 88", S("TU OM SK", R("SK", S("HI HI")), R("CUL", S("CUL 73")))), R("GN OM", S("GN ES GL", R("TU", S("73")), R("73", S("SK"))))),
]

HARD = [
 S("CQD CQD DE COG", R("DE LT QTH?", S("5 NM N OF LT", R("R BOAT SENT", S("TU OM HURRY")), R("WATER IN HULL?", S("YES PUMPS ON")))), R("R R LT HR K", S("ICE RUDDER GONE", R("R DROP ANCHOR", S("R ANCHOR DOWN")), R("BOAT IN 10 MIN", S("TU TU OM"))))),
 S("LT DE NORTHSTAR K", R("GE OM UR QTH?", S("QTH 3 NM WEST", R("R STEER EAST", S("R TU OM 73")), R("PSE QRS", S("R QRS TU")))), R("R K UR MSG?", S("MSG 2 BOXES TEA", R("FB TU OM", S("BRING TMW")), R("QSL 2 BOXES", S("FB QSL 73"))))),
 S("ICE 4 NM N OF LT", R("R TU OM", S("UR WX HR?", R("WX CLEAR COLD", S("FB GL OM 73")), R("WX THICK FOG", S("R LIGHT ON?")))), R("HW BIG?", S("BERG BIG", R("R STEER SOUTH", S("R TU STEER S")), R("R GO SLOW PSE", S("R SLOW 73"))))),
 S("QRM HR PSE RPT UR WX", R("WX STORM HR", S("R STAY IN PORT", R("FB GL OM", S("TU GL 73")), R("R SAFE?", S("YES SAFE TU")))), R("WX SUN ES WIND", S("FB TU COMING TDY", R("R WELCOME", S("TU 73 SK")), R("CUL OM", S("CUL ES 73"))))),
 S("GM LT DE SEAL", R("GM OM HW?", S("FB HR ES UR?", R("FB HR ES SUN", S("NICE 73")), R("TIRED BUT OK", S("HI HI TU 73")))), R("GM OM UR QTH?", S("QTH ROCKS EAST", R("R SUN HR", S("FB TU OM")), R("R CUL", S("CUL 73 SK"))))),
 S("SOS SOS DE CRAB", R("DE LT QTH K", S("HARBOR MOUTH", R("R BOAT SENT", S("TU TU HURRY")), R("UR PROBLEM?", S("SAIL TORN")))), R("R R WHAT HAPPENED?", S("ENGINE DEAD FOG", R("R LIGHT ON K", S("SEE LIGHT TU")), R("R DROP ANCHOR", S("R ANCHOR TU 73"))))),
 S("CQ CQ CQ DE FRIEDA", R("DE LT K", S("HI LT NEW HR", R("FB WELCOME", S("TU OM 73")), R("UR QTH?", S("QTH WEST BAY")))), R("QRZ? PSE AGN", S("DE FRIEDA FRIEDA", R("R GE FRIEDA", S("GE OM TU 73")), R("QSL FRIEDA", S("FB QSL 73"))))),
 S("MSG FROM PAUSBACKE", R("R PSE MSG K", S("SHE ARRIVES TMW", R("FB TU OM", S("R 73 SK")), R("WHAT TIME?", S("8 AM EARLY")))), R("R TU WHAT?", S("FISH FOR GASTON", R("HI HI FB TU", S("NP 73")), R("GREAT TU OM", S("73 ES GL"))))),
 S("UR LIGHT OFF?", R("NO LIGHT ON", S("SRI SEE NIL", R("R FOG HR", S("R TU GO SLOW")), R("QTH PSE?", S("QTH 2 NM SOUTH")))), R("YES PSE WAIT", S("R WAITING HR", R("LIGHT BACK ON", S("FB SEE IT TU")), R("TU OM 5 MIN", S("R OK 73"))))),
 S("HR WALRUS 30 GUESTS", R("R UR QTH?", S("NORTH BAY COMING", R("R PORT FREE", S("TU FB 73")), R("PSE QRS", S("R QRS TU")))), R("FB WELCOME", S("TU ANY TEA?", R("YES 30 CUPS", S("HI HI FB TU")), R("YES ES CAKE", S("GREAT TU 73"))))),
 S("GE LT WX TMW?", R("WX SUN TMW", S("FB TU SAIL EARLY", R("GL OM", S("TU GL 73")), R("CUL TMW", S("CUL 73 SK")))), R("WX STORM TMW", S("R STAY HR", R("FB SAFE", S("TU 73")), R("GN OM 73", S("GN 73 SK"))))),
 S("RPT RPT UR MSG", R("QRM HR SRI", S("R QRN HR TOO", R("PSE QRS", S("R QRS K")), R("RPT LATER", S("R CUL")))), R("R COMING 8 AM", S("QSL 8 AM TU", R("FB 73", S("73 SK")), R("R CUL", S("CUL OM 73"))))),
]

GLOSS = {"CQ": "calling all stations", "CQD": "distress call (1912)", "SOS": "distress call", "DE": "from", "K": "over, go ahead", "R": "received",
 "AR": "end of message", "SK": "end of contact", "TU": "thank you", "TNX": "thanks", "GM": "good morning", "GE": "good evening", "GN": "good night",
 "OM": "old man, friend", "WX": "weather", "HR": "here", "UR": "your", "FB": "fine business, great", "ES": "and", "HW": "how are you", "PSE": "please",
 "RPT": "repeat", "AGN": "again", "CUL": "see you later", "73": "best regards", "88": "love and kisses", "QTH": "location", "QRM": "interference",
 "QRN": "static", "QRS": "send slower", "QSL": "confirmed", "QRZ": "who is calling?", "MSG": "message", "NIL": "nothing", "SRI": "sorry",
 "GL": "good luck", "LT": "lighthouse", "NM": "nautical miles", "HI": "laughter", "MIN": "minutes", "TMW": "tomorrow", "TDY": "today",
 "NP": "no problem", "BERG": "iceberg"}

MC = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789? ")
out = {}
for name, convs in (("easy", EASY), ("medium", MEDIUM), ("hard", HARD)):
    n = 0; longest = 0
    def walk(node):
        global n, longest
        assert set(node["s"]) <= MC, node["s"]; n += 1
        for r in node.get("r", []):
            assert set(r["m"]) <= MC, r["m"]; n += 1; longest = max(longest, len(r["m"])); walk(r["n"])
    for c in convs: walk(c)
    print(name, len(convs), "convs", n, "msgs, longest reply", longest)
    out[name] = convs
out["gloss"] = GLOSS
json.dump(out, open("morse_conv.json", "w"), ensure_ascii=False, separators=(",", ":"))
