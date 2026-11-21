# Morse conversations for the lighthouse wireless room -> morse_conv.json
# S(ship message, replies...) / R(our reply, ship answer). The lighthouse's call sign is LT.
import json, re
def S(m, *r): return {"s": m, "r": list(r)} if r else {"s": m}
def R(m, n): return {"m": m, "n": n}

EASY = [
 S("GM LT", R("GM", S("WX OK?", R("JA", S("FB 73")), R("NEBEL", S("R TU 73")))), R("MOIN", S("MOIN OM", R("TU", S("73")), R("HALLO", S("HI HI 73"))))),
 S("HALLO LT", R("HALLO", S("HW?", R("GUT", S("FB 73")), R("OK", S("R GN")))), R("WER?", S("DE MOEWE", R("MOIN", S("MOIN 73")), R("TU", S("GN SK"))))),
 S("GE LT", R("GE", S("SONNE HR", R("FB", S("TU 73")), R("SUPER", S("JA 73")))), R("HI", S("HI OM", R("WX?", S("WIND 73")), R("GE OM", S("TU GN"))))),
 S("SOS", R("WO?", S("HAFEN", R("OK", S("TU TU")), R("KOMME", S("FB 73")))), R("R", S("MAST WEG", R("HILFE", S("TU OM")), R("OK", S("R SK"))))),
 S("CQ", R("LT", S("HI LT", R("HI", S("WX?", R("SONNE", S("FB 73")), R("WIND", S("R 73")))), R("GM", S("GM OM 73")))), R("HALLO", S("DE OTTER", R("HI", S("FISCH?", R("JA", S("FB GN")), R("NEIN", S("SRI 73")))), R("GM", S("GM 73"))))),
 S("FISCH?", R("JA", S("WO?", R("HAFEN", S("TU 73")), R("NORD", S("FB GN")))), R("NEIN", S("SRI", R("OK", S("73")), R("MORGEN", S("R 73"))))),
 S("EIS HR", R("R", S("TU", R("GL", S("TU GL")), R("73", S("73 SK")))), R("WO?", S("NORD", R("TU", S("R 73")), R("OK", S("GN"))))),
 S("TEE?", R("JA", S("FB HI", R("TU", S("73")), R("ZUCKER", S("HI HI GN")))), R("NEIN", S("KAFFEE?", R("JA", S("FB 73")), R("NEIN", S("OK GN"))))),
 S("GN LT", R("GN", S("TU OM", R("73", S("73 SK")), R("88", S("HI 88")))), R("SCHON?", S("JA MUEDE", R("OK", S("GN 73")), R("SCHLAF", S("TU GN"))))),
 S("NEBEL", R("R", S("LICHT?", R("JA", S("TU TU")), R("AN", S("FB 73")))), R("HIER", S("DICHT?", R("JA", S("R 73")), R("ETWAS", S("OK TU"))))),
 S("HUNGER", R("FISCH", S("FB", R("GUT?", S("JA TU")), R("73", S("73")))), R("KEKS?", S("JA TU", R("NOCH?", S("JA HI")), R("OK", S("FB GN"))))),
 S("WIND?", R("JA", S("STARK?", R("JA", S("R TU")), R("NEIN", S("FB 73")))), R("NEIN", S("FB", R("SONNE", S("SUPER 73")), R("RUHIG", S("TU GN"))))),
]

MEDIUM = [
 S("CQ DE MOEWE", R("DE LT K", S("GM OM UR WX?", R("SONNE", S("FB TU 73")), R("REGEN", S("SRI OM 73")))), R("QRZ?", S("DE MOEWE K", R("GM OM", S("GM TU K")), R("R TU", S("73 SK"))))),
 S("LT DE ANNA K", R("R K", S("QTH HAFEN", R("FB", S("TU 73 SK")), R("WILLKOMMEN", S("TU OM 73")))), R("GE OM", S("GE UR WX?", R("NEBEL", S("R TU K")), R("KLAR", S("FB 73"))))),
 S("NEBEL HR DICHT", R("R LICHT AN", S("TU OM FB", R("GL", S("TU GL 73")), R("73", S("73 SK")))), R("QTH?", S("NAHE HAFEN", R("PSE LANGSAM", S("R TU")), R("R K", S("FB 73"))))),
 S("PSE RPT", R("HAFEN OFFEN", S("R TU", R("AR", S("73 SK")), R("CUL", S("CUL 73")))), R("QRM HR", S("RPT AGN?", R("JA", S("R K")), R("NEIN", S("OK 73"))))),
 S("MSG FUER LT", R("R K", S("POST MORGEN", R("FB TU", S("73")), R("WANN?", S("FRUEH 73")))), R("PSE AGN", S("MSG FUER LT", R("R TU", S("FB K")), R("QSL", S("TU 73 SK"))))),
 S("SOS MAST BRUCH", R("QTH?", S("NORD KAP", R("R KOMME", S("TU TU OM")), R("BOOT KOMMT", S("FB TU")))), R("R R", S("WASSER HR", R("PUMPEN", S("R TU")), R("BOOT KOMMT", S("TU OM 73"))))),
 S("GM HW UR WX?", R("WX SONNE", S("FB HR AUCH", R("SUPER", S("TU 73")), R("CUL", S("CUL OM")))), R("WX REGEN", S("SRI OM", R("NIL", S("HI HI 73")), R("TU", S("73 SK"))))),
 S("EIS IM HAFEN?", R("NEIN", S("FB TU", R("GL", S("TU 73")), R("KOMMEN?", S("JA MORGEN")))), R("JA ETWAS", S("R LANGSAM", R("FB", S("TU 73")), R("GL OM", S("TU GL"))))),
 S("CQ CQ DE OTTER", R("DE LT K", S("HI LT ES FISCH", R("FB", S("TU 73")), R("VIEL?", S("JA 10 KISTEN")))), R("GE OTTER", S("GE OM UR QTH?", R("LT HR", S("FB 73")), R("HAFEN", S("R TU"))))),
 S("TNX FUER LICHT", R("GERN OM", S("FB 73 SK", R("73", S("SK")), R("CUL", S("CUL 73")))), R("NIL DANK", S("HI HI FB", R("GL", S("TU GL")), R("73", S("73 SK"))))),
 S("SRI QRM HR", R("PSE AGN", S("RPT WX OK", R("R TU", S("73")), R("QSL", S("FB 73")))), R("QSL?", S("QSL TU OM", R("73", S("73 SK")), R("CUL", S("CUL OM"))))),
 S("GN LT 88", R("GN 88", S("TU OM SK", R("SK", S("HI HI")), R("CUL", S("CUL 73")))), R("GN OM", S("GN ES GL", R("TU", S("73")), R("73", S("SK"))))),
]

HARD = [
 S("CQD CQD DE KOGGE", R("DE LT QTH?", S("5 SM NORD LT", R("R BOOT KOMMT", S("TU OM SCHNELL")), R("WASSER IM BOOT?", S("JA PUMPEN LAUFEN")))), R("R R LT HR K", S("EIS RUDER WEG", R("R ANKER WERFEN", S("R ANKER UNTEN")), R("BOOT KOMMT 10 MIN", S("TU TU OM"))))),
 S("LT DE NORDSTERN K", R("GE OM UR QTH?", S("QTH 3 SM WEST", R("R KURS OST", S("R TU OM 73")), R("PSE LANGSAM HR", S("R LANGSAM TU")))), R("R K UR MSG?", S("MSG 2 KISTEN TEE", R("FB TU OM", S("BRINGE MORGEN")), R("QSL 2 KISTEN", S("FB QSL 73"))))),
 S("EIS 4 SM NORD LT", R("R TU OM", S("UR WX HR?", R("WX KLAR KALT", S("FB GL OM 73")), R("WX NEBEL DICHT", S("R LICHT AN?")))), R("HW GROSS?", S("BERG GROSS", R("R KURS SUED", S("R TU KURS SUED")), R("R LANGSAM PSE", S("R LANGSAM 73"))))),
 S("QRM HR PSE RPT UR WX", R("WX STURM HR", S("R BLEIBE IM HAFEN", R("FB GL OM", S("TU GL 73")), R("R SICHER?", S("JA SICHER TU")))), R("WX SONNE ES WIND", S("FB TU KOMME HEUTE", R("R WILLKOMMEN", S("TU 73 SK")), R("CUL OM", S("CUL ES 73"))))),
 S("GM LT DE SEEHUND", R("GM OM HW?", S("FB HR ES UR?", R("FB HR ES SONNE", S("SUPER 73")), R("MUEDE ABER OK", S("HI HI TU 73")))), R("GM OM UR QTH?", S("QTH FELSEN OST", R("R SONNE HR", S("FB TU OM")), R("R CUL", S("CUL 73 SK"))))),
 S("SOS SOS DE KRABBE", R("DE LT QTH K", S("HAFEN EINFAHRT", R("R BOOT KOMMT", S("TU TU SCHNELL")), R("UR PROBLEM?", S("SEGEL KAPUTT")))), R("R R WAS LOS?", S("MOTOR AUS NEBEL", R("R LICHT AN K", S("SEHE LICHT TU")), R("R ANKER WERFEN", S("R ANKER TU 73"))))),
 S("CQ CQ CQ DE FRIEDA", R("DE LT K", S("HI LT NEU HR", R("FB WILLKOMMEN", S("TU OM 73")), R("UR QTH?", S("QTH WEST BUCHT")))), R("QRZ? PSE AGN", S("DE FRIEDA FRIEDA", R("R GE FRIEDA", S("GE OM TU 73")), R("QSL FRIEDA", S("FB QSL 73"))))),
 S("MSG VON PAUSBACKE", R("R PSE MSG K", S("SIE KOMMT MORGEN", R("FB TU OM", S("R 73 SK")), R("WANN GENAU?", S("8 UHR FRUEH")))), R("R TU WAS?", S("FISCH FUER GASTON", R("HI HI FB TU", S("GERN 73")), R("SUPER TU OM", S("73 ES GL"))))),
 S("UR LICHT AUS?", R("NEIN LICHT AN", S("SRI SEHE NIL", R("R NEBEL HR", S("R TU LANGSAM")), R("QTH PSE?", S("QTH 2 SM SUED")))), R("JA PSE WARTEN", S("R WARTE HR", R("LICHT WIEDER AN", S("FB SEHE TU")), R("TU OM 5 MIN", S("R OK 73"))))),
 S("HR WALROSS 30 GAESTE", R("R UR QTH?", S("BUCHT NORD KOMMEN", R("R HAFEN FREI", S("TU FB 73")), R("PSE LANGSAM", S("R LANGSAM TU")))), R("FB WILLKOMMEN", S("TU GIBT ES TEE?", R("JA 30 TASSEN", S("HI HI FB TU")), R("JA ES KEKSE", S("SUPER TU 73"))))),
 S("GE LT WX MORGEN?", R("WX SONNE MORGEN", S("FB TU FAHRE FRUEH", R("GL OM", S("TU GL 73")), R("CUL MORGEN", S("CUL 73 SK")))), R("WX STURM MORGEN", S("R BLEIBE HR", R("FB SICHER", S("TU 73")), R("GN OM 73", S("GN 73 SK"))))),
 S("RPT RPT UR MSG", R("QRM HR SRI", S("R QRN AUCH HR", R("PSE LANGSAM", S("R LANGSAM K")), R("RPT SPAETER", S("R CUL")))), R("R KOMME 8 UHR", S("QSL 8 UHR TU", R("FB 73", S("73 SK")), R("R CUL", S("CUL OM 73"))))),
]

GLOSS = {"CQ": "An alle", "CQD": "Notruf (1912)", "SOS": "Notruf", "DE": "von", "K": "Bitte kommen", "R": "Verstanden", "AR": "Ende Nachricht",
 "SK": "Ende Verbindung", "TU": "Danke", "TNX": "Danke", "GM": "Guten Morgen", "GE": "Guten Abend", "GN": "Gute Nacht", "OM": "Alter Freund",
 "WX": "Wetter", "HR": "hier", "UR": "dein / euer", "FB": "Prima", "ES": "und", "HW": "Wie geht's", "PSE": "bitte", "RPT": "wiederholen",
 "AGN": "nochmal", "CUL": "Bis bald", "73": "Viele Grüße", "88": "Liebe Grüße", "QTH": "Standort", "QRM": "Störung", "QRN": "Rauschen",
 "QSL": "Bestätigt", "QRZ": "Wer ruft?", "MSG": "Nachricht", "NIL": "nichts", "SRI": "Entschuldigung", "GL": "Viel Glück", "LT": "Leuchtturm",
 "SM": "Seemeilen", "HI": "Lachen", "MIN": "Minuten"}

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
    print(name, len(convs), "Gespräche", n, "Nachrichten, längste Antwort", longest)
    out[name] = convs
out["gloss"] = GLOSS
json.dump(out, open("morse_conv.json", "w"), ensure_ascii=False, separators=(",", ":"))
