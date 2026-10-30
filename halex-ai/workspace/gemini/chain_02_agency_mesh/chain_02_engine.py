"""Gate-fixed Module 47 C02-ADAM. Agency counts are real arithmetic
(150x2=300, 50x2=100). No agent executes anything by itself: a task
returns NOT_EXECUTED unless the caller supplies a handler callable."""
class AgencyUnit:
    def __init__(self, agency_id, agency_type, domain):
        self.agency_id = agency_id; self.agency_type = agency_type; self.domain = domain
    def execute(self, directive, handler=None):
        if handler is None:
            return {"agency_id": self.agency_id, "status": "NOT_EXECUTED", "directive": directive}
        return {"agency_id": self.agency_id, "status": "EXECUTED", "result": handler(directive)}
class Chain02Mesh:
    def __init__(self):
        self.general = [AgencyUnit(f"GEN-AGENCY-{i:03d}", "General Intelligence", f"Cognitive Domain {i}") for i in range(1, 151)]
        self.dev = [AgencyUnit(f"DEV-AGENCY-{i:03d}", "Software Development", f"Software Domain {i}") for i in range(1, 51)]
    def summary(self):
        return {"general_agencies": len(self.general), "general_agents": len(self.general)*2,
                "dev_agencies": len(self.dev), "dev_agents": len(self.dev)*2,
                "total_agencies": len(self.general)+len(self.dev), "total_agents": len(self.general)*2+len(self.dev)*2}
    def dispatch(self, directive, handler=None):
        results = [a.execute(directive, handler) for a in self.general + self.dev]
        return {"directive": directive, "executed": sum(1 for r in results if r["status"]=="EXECUTED"),
                "not_executed": sum(1 for r in results if r["status"]=="NOT_EXECUTED"), "results": results}
