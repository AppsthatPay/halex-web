"""Gate-fixed Module 46 CHAIN-01. An INDEX of languages and operating
systems with real paradigm/kernel facts. Nothing here compiles, runs,
or grants executable access. Access status is INDEX_ONLY."""
LANGUAGES = {"Rust": ("systems", ".rs"), "Python": ("scripting", ".py"), "C++": ("systems", ".cpp"),
 "C": ("systems", ".c"), "Go": ("systems", ".go"), "JavaScript": ("web", ".js"),
 "TypeScript": ("web", ".ts"), "Solidity": ("smart contract", ".sol"), "Java": ("application", ".java"),
 "Kotlin": ("application", ".kt"), "Swift": ("application", ".swift"), "Ruby": ("scripting", ".rb"),
 "PHP": ("web", ".php"), "Assembly": ("low-level", ".asm")}
OSES = {"Linux": "monolithic kernel", "FreeBSD": "monolithic kernel", "OpenBSD": "monolithic kernel",
 "NetBSD": "monolithic kernel", "FreeRTOS": "real-time kernel", "Zephyr": "real-time kernel",
 "Haiku": "hybrid kernel", "ReactOS": "NT-compatible hybrid kernel", "L4": "microkernel"}
def query(target):
    t = target.lower()
    langs = {k: v for k, v in LANGUAGES.items() if t in k.lower()}
    oses = {k: v for k, v in OSES.items() if t in k.lower()}
    return {"matched_languages": langs, "matched_operating_systems": oses,
            "access_status": "INDEX_ONLY", "found": bool(langs or oses), "seed_marker": "ZINIUM-SEED-GEMINI"}
